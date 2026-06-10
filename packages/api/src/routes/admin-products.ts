import { adminDb, adminOptions, adminProducts } from '@lotr/db/admin';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin-auth';

const productsRoutes = new Hono();

productsRoutes.use('/*', adminAuth);

productsRoutes.get('/', async (c) => {
  const products = await adminDb.select().from(adminProducts);
  return c.json(products);
});

productsRoutes.post('/', async (c) => {
  let body: {
    name: string;
    color: string;
    scent: string;
    shape: string;
    weight: number;
    price: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (
    typeof body.name !== 'string' ||
    body.name.trim().length === 0 ||
    typeof body.color !== 'string' ||
    body.color.trim().length === 0 ||
    typeof body.scent !== 'string' ||
    body.scent.trim().length === 0 ||
    typeof body.shape !== 'string' ||
    body.shape.trim().length === 0
  ) {
    return c.json({ error: 'Invalid product fields' }, 422);
  }

  // weight + price must be non-negative integers (SQLite integer columns).
  // Reject floats at the API boundary so the contract is honest.
  const weight = Number(body.weight);
  const price = Number(body.price);
  if (!Number.isInteger(weight) || weight < 0 || !Number.isInteger(price) || price < 0) {
    return c.json({ error: 'Weight and price must be non-negative integers' }, 422);
  }

  const opts = await adminDb.select().from(adminOptions).limit(1);
  const bounds = opts[0];

  if (bounds) {
    if (price < bounds.minPrice || price > bounds.maxPrice) {
      return c.json(
        { error: `Price must be between ${bounds.minPrice} and ${bounds.maxPrice}` },
        422,
      );
    }
    if (weight < bounds.minSize || weight > bounds.maxSize) {
      return c.json(
        { error: `Weight must be between ${bounds.minSize} and ${bounds.maxSize}` },
        422,
      );
    }
  }

  const now = new Date().toISOString();
  const result = await adminDb
    .insert(adminProducts)
    .values({
      name: body.name.trim(),
      color: body.color.trim(),
      scent: body.scent.trim(),
      shape: body.shape.trim(),
      weight,
      price,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(result[0], 201);
});

productsRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: 'Invalid id' }, 400);
  }
  const product = await adminDb
    .select()
    .from(adminProducts)
    .where(eq(adminProducts.id, id))
    .limit(1);

  if (!product[0]) {
    return c.json({ error: 'Product not found' }, 404);
  }

  await adminDb.delete(adminProducts).where(eq(adminProducts.id, id));
  return c.json({ success: true });
});

export default productsRoutes;
