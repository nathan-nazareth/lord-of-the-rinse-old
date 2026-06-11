import { db, sql } from '@lotr/db';
import { catalogAttributes, soapVariants, variantAttributes } from '@lotr/db/schema';
import { createVariantSchema, updateVariantSchema } from '@lotr/shared';
import { and, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';

const variantsRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// List variants (with optional enabled/archived filters)
variantsRoutes.get('/', async (c) => {
  const includeArchived = c.req.query('includeArchived') === 'true';
  const enabledOnly = c.req.query('enabledOnly') === 'true';

  const conditions: SQL[] = [];
  if (!includeArchived) {
    conditions.push(eq(soapVariants.archived, false));
  }
  if (enabledOnly) {
    conditions.push(eq(soapVariants.enabled, true));
  }

  const variants = await db
    .select()
    .from(soapVariants)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(soapVariants.createdAt));

  // Fetch attributes for all variants
  const variantIds = variants.map((v) => v.id);
  const attrs =
    variantIds.length > 0
      ? await db
          .select()
          .from(variantAttributes)
          .where(inArray(variantAttributes.variantId, variantIds))
      : [];

  // Group attributes by variant
  const attrsByVariant = new Map<string, { attributeId: string; value: string }[]>();
  for (const a of attrs) {
    const list = attrsByVariant.get(a.variantId) || [];
    list.push({ attributeId: a.attributeId, value: a.value });
    attrsByVariant.set(a.variantId, list);
  }

  const result = variants.map((v) => ({
    ...v,
    attributes: attrsByVariant.get(v.id) || [],
  }));

  return c.json({ variants: result });
});

// Get single variant with attributes
variantsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return c.json({ error: 'Invalid ID format' }, 400);

  const [variant] = await db.select().from(soapVariants).where(eq(soapVariants.id, id));

  if (!variant) {
    return c.json({ error: 'Variant not found' }, 404);
  }

  const attrs = await db
    .select({
      attributeId: variantAttributes.attributeId,
      value: variantAttributes.value,
    })
    .from(variantAttributes)
    .where(eq(variantAttributes.variantId, id));

  return c.json({ variant: { ...variant, attributes: attrs } });
});

// Create variant with attribute references
variantsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createVariantSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { name, slug, unitPrice, attributes } = parsed.data;

  // Check for duplicate slug
  const [existing] = await db
    .select({ id: soapVariants.id })
    .from(soapVariants)
    .where(eq(soapVariants.slug, slug));

  if (existing) {
    return c.json({ error: 'A variant with this slug already exists' }, 409);
  }

  // Validate that all attribute IDs exist
  const attrIds = attributes.map((a) => a.attributeId);
  const foundAttrs = await db
    .select({ id: catalogAttributes.id })
    .from(catalogAttributes)
    .where(inArray(catalogAttributes.id, attrIds));

  if (foundAttrs.length !== attrIds.length) {
    return c.json({ error: 'One or more attribute IDs are invalid' }, 400);
  }

  // Wrap the variant + attribute-link inserts in a single transaction so a
  // failure on the second insert can't leave a half-created variant with
  // no attributes visible to the storefront.
  const result = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(soapVariants)
      .values({ name, slug, unitPrice })
      .returning();
    if (!created) {
      throw new Error('variant_insert_returned_no_row');
    }
    await tx.insert(variantAttributes).values(
      attributes.map((a) => ({
        variantId: created.id,
        attributeId: a.attributeId,
        value: a.value,
      })),
    );
    return { ...created, attributes };
  });

  return c.json({ variant: result }, 201);
});

// Update variant (name, slug, price, enabled, archived, attributes)
variantsRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return c.json({ error: 'Invalid ID format' }, 400);
  const body = await c.req.json();
  const parsed = updateVariantSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { attributes: newAttrs, ...variantFields } = parsed.data;

  // Do existence / slug / attribute-id checks and the mutation inside a
  // single transaction so a concurrent DELETE can't race the read.
  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(soapVariants)
      .where(eq(soapVariants.id, id))
      .for('update');

    if (!existing) {
      return { notFound: true as const };
    }

    // Check for duplicate slug if slug is being changed
    if (variantFields.slug && variantFields.slug !== existing.slug) {
      const [slugConflict] = await tx
        .select({ id: soapVariants.id })
        .from(soapVariants)
        .where(eq(soapVariants.slug, variantFields.slug));
      if (slugConflict) {
        return { slugConflict: true as const };
      }
    }

    // If attributes are provided, validate they exist
    if (newAttrs) {
      const attrIds = newAttrs.map((a) => a.attributeId);
      const foundAttrs = await tx
        .select({ id: catalogAttributes.id })
        .from(catalogAttributes)
        .where(inArray(catalogAttributes.id, attrIds));
      if (foundAttrs.length !== attrIds.length) {
        return { invalidAttributes: true as const };
      }
    }

    const [updated] = await tx
      .update(soapVariants)
      .set({
        ...variantFields,
        updatedAt: sql`now()`,
      })
      .where(eq(soapVariants.id, id))
      .returning();

    if (!updated) {
      throw new Error('variant_update_returned_no_row');
    }

    let finalAttrs: { attributeId: string; value: string }[] = await tx
      .select({
        attributeId: variantAttributes.attributeId,
        value: variantAttributes.value,
      })
      .from(variantAttributes)
      .where(eq(variantAttributes.variantId, id));

    if (newAttrs) {
      await tx.delete(variantAttributes).where(eq(variantAttributes.variantId, id));
      await tx.insert(variantAttributes).values(
        newAttrs.map((a) => ({
          variantId: id,
          attributeId: a.attributeId,
          value: a.value,
        })),
      );
      finalAttrs = newAttrs;
    }

    return { variant: { ...updated, attributes: finalAttrs } };
  });

  if ('notFound' in result) return c.json({ error: 'Variant not found' }, 404);
  if ('slugConflict' in result)
    return c.json({ error: 'A variant with this slug already exists' }, 409);
  if ('invalidAttributes' in result)
    return c.json({ error: 'One or more attribute IDs are invalid' }, 400);
  return c.json(result);
});

// Archive variant (soft delete)
variantsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return c.json({ error: 'Invalid ID format' }, 400);

  try {
    const [existing] = await db.select().from(soapVariants).where(eq(soapVariants.id, id));

    if (!existing) {
      return c.json({ error: 'Variant not found' }, 404);
    }

    const [archived] = await db
      .update(soapVariants)
      .set({ archived: true, updatedAt: sql`now()` })
      .where(eq(soapVariants.id, id))
      .returning();

    if (!archived) {
      return c.json({ error: 'Variant not found' }, 404);
    }

    const attrs = await db
      .select({
        attributeId: variantAttributes.attributeId,
        value: variantAttributes.value,
      })
      .from(variantAttributes)
      .where(eq(variantAttributes.variantId, id));

    return c.json({ variant: { ...archived, attributes: attrs } });
  } catch (err) {
    console.error('[variants] archive failed:', err);
    return c.json({ error: 'Failed to archive variant' }, 500);
  }
});

export default variantsRoutes;
