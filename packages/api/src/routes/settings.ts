import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '@lotr/db';
import { commerceSettings } from '@lotr/db/schema';
import { settingsUpdateSchema } from '@lotr/shared/schemas';

const settings = new Hono();

// GET /api/admin/settings — list all settings
settings.get('/', async (c) => {
  const rows = await db.select().from(commerceSettings);
  return c.json(rows);
});

// GET /api/admin/settings/:key — get single setting
settings.get('/:key', async (c) => {
  const key = c.req.param('key');
  const row = await db
    .select()
    .from(commerceSettings)
    .where(eq(commerceSettings.key, key))
    .limit(1);

  if (row.length === 0) {
    return c.json({ error: 'Setting not found' }, 404);
  }

  return c.json(row[0]);
});

// PUT /api/admin/settings — upsert a setting
settings.put('/', async (c) => {
  const body = await c.req.json();
  const parsed = settingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.issues }, 400);
  }

  const { key, value } = parsed.data;

  const [upserted] = await db
    .insert(commerceSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: commerceSettings.key,
      set: { value, updatedAt: new Date() },
    })
    .returning();

  return c.json(upserted);
});

// PUT /api/admin/settings/batch — upsert multiple settings
settings.put('/batch', async (c) => {
  const body = await c.req.json();

  if (!Array.isArray(body)) {
    return c.json({ error: 'Expected an array of settings' }, 400);
  }

  const validated = body
    .map((item: unknown) => settingsUpdateSchema.safeParse(item))
    .filter((r: { success: boolean }) => r.success)
    .map((r: { data: { key: string; value: string } }) => r.data);

  if (validated.length === 0) {
    return c.json({ error: 'No valid settings provided' }, 400);
  }

  const results = [];
  for (const { key, value } of validated) {
    const [upserted] = await db
      .insert(commerceSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: commerceSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    results.push(upserted);
  }

  return c.json(results);
});

// DELETE /api/admin/settings/:key — delete a setting
settings.delete('/:key', async (c) => {
  const key = c.req.param('key');

  const result = await db
    .delete(commerceSettings)
    .where(eq(commerceSettings.key, key))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Setting not found' }, 404);
  }

  return c.json({ success: true });
});

export default settings;
