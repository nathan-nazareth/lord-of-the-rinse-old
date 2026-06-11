import { db, sql } from '@lotr/db';
import { catalogAttributes } from '@lotr/db/schema';
import { attributeTypeSchema, createAttributeSchema, updateAttributeSchema } from '@lotr/shared';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const attributesRoutes = new Hono<{
  Variables: {
    user: unknown;
    session: unknown;
  };
}>();

// Defense in depth: also enforce admin auth at the router level so a future
// refactor that moves this mount out from under the global `/api/admin/*`
// guard doesn't accidentally expose catalog mutations to the public.
attributesRoutes.use('/*', adminAuth);

// List attributes (with optional type filter and archived filter)
attributesRoutes.get('/', async (c) => {
  const typeFilter = c.req.query('type');
  const includeArchived = c.req.query('includeArchived') === 'true';

  const conditions: SQL[] = [];
  if (typeFilter) {
    const parsed = attributeTypeSchema.safeParse(typeFilter);
    if (!parsed.success) {
      return c.json({ error: 'Invalid type filter' }, 400);
    }
    conditions.push(eq(catalogAttributes.type, parsed.data));
  }
  if (!includeArchived) {
    conditions.push(eq(catalogAttributes.archived, false));
  }

  const result = await db
    .select()
    .from(catalogAttributes)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(catalogAttributes.displayOrder), asc(catalogAttributes.name));

  return c.json({ attributes: result });
});

// Get single attribute
attributesRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const [result] = await db.select().from(catalogAttributes).where(eq(catalogAttributes.id, id));

  if (!result) {
    return c.json({ error: 'Attribute not found' }, 404);
  }

  return c.json({ attribute: result });
});

// Create attribute
attributesRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createAttributeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { type, name, slug, displayOrder } = parsed.data;

  // Check for duplicate slug
  const [existing] = await db
    .select({ id: catalogAttributes.id })
    .from(catalogAttributes)
    .where(eq(catalogAttributes.slug, slug));

  if (existing) {
    return c.json({ error: 'An attribute with this slug already exists' }, 409);
  }

  const [created] = await db
    .insert(catalogAttributes)
    .values({ type, name, slug, displayOrder })
    .returning();

  if (!created) {
    console.error('[attributes] insert returned no row');
    return c.json({ error: 'Failed to create attribute' }, 500);
  }

  return c.json({ attribute: created }, 201);
});

// Update attribute
attributesRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateAttributeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Check attribute exists
  const [existing] = await db.select().from(catalogAttributes).where(eq(catalogAttributes.id, id));

  if (!existing) {
    return c.json({ error: 'Attribute not found' }, 404);
  }

  // Check for duplicate slug if slug is being changed
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const [slugConflict] = await db
      .select({ id: catalogAttributes.id })
      .from(catalogAttributes)
      .where(eq(catalogAttributes.slug, parsed.data.slug));

    if (slugConflict) {
      return c.json({ error: 'An attribute with this slug already exists' }, 409);
    }
  }

  const [updated] = await db
    .update(catalogAttributes)
    .set({
      ...parsed.data,
      updatedAt: sql`now()`,
    })
    .where(eq(catalogAttributes.id, id))
    .returning();

  if (!updated) {
    console.error('[attributes] update returned no row for id', id);
    return c.json({ error: 'Failed to update attribute' }, 500);
  }

  return c.json({ attribute: updated });
});

// Archive attribute
attributesRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const [existing] = await db
      .select()
      .from(catalogAttributes)
      .where(eq(catalogAttributes.id, id));

    if (!existing) {
      return c.json({ error: 'Attribute not found' }, 404);
    }

    const [archived] = await db
      .update(catalogAttributes)
      .set({ archived: true, updatedAt: sql`now()`, displayOrder: existing.displayOrder })
      .where(eq(catalogAttributes.id, id))
      .returning();

    if (!archived) {
      return c.json({ error: 'Attribute not found' }, 404);
    }

    return c.json({ attribute: archived });
  } catch (err) {
    console.error('[attributes] archive failed:', err);
    return c.json({ error: 'Failed to archive attribute' }, 500);
  }
});

export default attributesRoutes;
