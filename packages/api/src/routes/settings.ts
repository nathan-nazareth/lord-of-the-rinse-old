import { db } from '@lotr/db';
import { commerceSettings } from '@lotr/db/schema';
import { settingsUpdateSchema } from '@lotr/shared/schemas';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const MAX_VALUE_LENGTH = 8192;
const MAX_KEY_LENGTH = 100;
const MAX_BATCH_SIZE = 100;

const settings = new Hono();

// Defense in depth: also enforce admin auth at the router level so a future
// refactor that moves this mount out from under the global `/api/admin/*`
// guard doesn't accidentally expose settings to the public.
settings.use('/*', adminAuth);

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
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const parsed = settingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.issues }, 400);
  }

  const { key, value } = parsed.data;
  if (key.length > MAX_KEY_LENGTH || value.length > MAX_VALUE_LENGTH) {
    return c.json(
      {
        error: `Key must be ≤ ${MAX_KEY_LENGTH} chars and value ≤ ${MAX_VALUE_LENGTH} chars`,
      },
      422,
    );
  }

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
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!Array.isArray(body)) {
    return c.json({ error: 'Expected an array of settings' }, 400);
  }
  if (body.length > MAX_BATCH_SIZE) {
    return c.json({ error: `Batch size must be ≤ ${MAX_BATCH_SIZE}` }, 422);
  }

  // Validate each item and collect errors so the admin sees *which* entries
  // were dropped — silently dropping invalid items hides data corruption.
  const validated: { key: string; value: string }[] = [];
  const rejected: { index: number; issues: unknown }[] = [];
  body.forEach((item: unknown, index: number) => {
    const r = settingsUpdateSchema.safeParse(item);
    if (r.success) {
      if (r.data.key.length > MAX_KEY_LENGTH || r.data.value.length > MAX_VALUE_LENGTH) {
        rejected.push({ index, issues: 'oversize' });
      } else {
        validated.push(r.data);
      }
    } else {
      rejected.push({ index, issues: r.error.issues });
    }
  });

  if (validated.length === 0) {
    return c.json({ error: 'No valid settings provided', rejected }, 400);
  }

  const results: { key: string; value: string }[] = [];
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

  return c.json({ upserted: results, rejected });
});

// DELETE /api/admin/settings/:key — delete a setting
settings.delete('/:key', async (c) => {
  const key = c.req.param('key');

  const result = await db.delete(commerceSettings).where(eq(commerceSettings.key, key)).returning();

  if (result.length === 0) {
    return c.json({ error: 'Setting not found' }, 404);
  }

  return c.json({ success: true });
});

export default settings;
