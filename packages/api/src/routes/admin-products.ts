import { Hono } from 'hono';
import { adminDb, adminProducts, adminOptions } from '@lotr/db/admin';
import { eq } from 'drizzle-orm';
import { adminAuth } from '../middleware/admin-auth';

const productsRoutes = new Hono();

productsRoutes.use('/*', adminAuth);

productsRoutes.get('/', async (c) => {
  const products = await adminDb.select().from(adminProducts);
  return c.json(products);
});

productsRoutes.post('/', async (c) => {
  const body = await c.req.json<{
    name: string;
    color: string;
    scent: string;
    shape: string;
    weight: number;
    price: number;
  }>();

  const opts = await adminDb.select().from(adminOptions).limit(1);
  const bounds = opts[0];

  if (bounds) {
    if (body.price < bounds.minPrice || body.price > bounds.maxPrice) {
      return c.json(
        { error: `Price must be between ${bounds.minPrice} and ${bounds.maxPrice}` },
        422,
      );
    }
    if (body.weight < bounds.minSize || body.weight > bounds.maxSize) {
      return c.json(
        { error: `Weight must be between ${bounds.minSize} and ${bounds.maxSize}` },
        422,
      );
    }
  }

  const now = new Date().toISOString();
  const result = await adminDb
    .insert(adminProducts)
    .values({ ...body, createdAt: now, updatedAt: now })
    .returning();

  return c.json(result[0], 201);
});

productsRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
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