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

  // Create variant
  const [created] = await db.insert(soapVariants).values({ name, slug, unitPrice }).returning();

  // Create variant-attribute links
  await db.insert(variantAttributes).values(
    attributes.map((a) => ({
      variantId: created.id,
      attributeId: a.attributeId,
      value: a.value,
    })),
  );

  return c.json(
    {
      variant: {
        ...created,
        attributes,
      },
    },
    201,
  );
});

// Update variant (name, slug, price, enabled, archived, attributes)
variantsRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateVariantSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Check variant exists
  const [existing] = await db.select().from(soapVariants).where(eq(soapVariants.id, id));

  if (!existing) {
    return c.json({ error: 'Variant not found' }, 404);
  }

  // Check for duplicate slug if slug is being changed
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const [slugConflict] = await db
      .select({ id: soapVariants.id })
      .from(soapVariants)
      .where(eq(soapVariants.slug, parsed.data.slug));

    if (slugConflict) {
      return c.json({ error: 'A variant with this slug already exists' }, 409);
    }
  }

  // If attributes are provided, validate they exist
  if (parsed.data.attributes) {
    const attrIds = parsed.data.attributes.map((a) => a.attributeId);
    const foundAttrs = await db
      .select({ id: catalogAttributes.id })
      .from(catalogAttributes)
      .where(inArray(catalogAttributes.id, attrIds));

    if (foundAttrs.length !== attrIds.length) {
      return c.json({ error: 'One or more attribute IDs are invalid' }, 400);
    }
  }

  const { attributes: newAttrs, ...variantFields } = parsed.data;

  const [updated] = await db
    .update(soapVariants)
    .set({
      ...variantFields,
      updatedAt: sql`now()`,
    })
    .where(eq(soapVariants.id, id))
    .returning();

  // Replace attribute references if provided
  let finalAttrs = await db
    .select({
      attributeId: variantAttributes.attributeId,
      value: variantAttributes.value,
    })
    .from(variantAttributes)
    .where(eq(variantAttributes.variantId, id));

  if (newAttrs) {
    await db.delete(variantAttributes).where(eq(variantAttributes.variantId, id));
    await db.insert(variantAttributes).values(
      newAttrs.map((a) => ({
        variantId: id,
        attributeId: a.attributeId,
        value: a.value,
      })),
    );
    finalAttrs = newAttrs;
  }

  return c.json({ variant: { ...updated, attributes: finalAttrs } });
});

// Archive variant (soft delete)
variantsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const [existing] = await db.select().from(soapVariants).where(eq(soapVariants.id, id));

  if (!existing) {
    return c.json({ error: 'Variant not found' }, 404);
  }

  const [archived] = await db
    .update(soapVariants)
    .set({ archived: true, updatedAt: sql`now()` })
    .where(eq(soapVariants.id, id))
    .returning();

  // Fetch current attributes for the response
  const attrs = await db
    .select({
      attributeId: variantAttributes.attributeId,
      value: variantAttributes.value,
    })
    .from(variantAttributes)
    .where(eq(variantAttributes.variantId, id));

  return c.json({ variant: { ...archived, attributes: attrs } });
});

export default variantsRoutes;
