import { adminDb, adminOptions } from './admin';

async function seed() {
  const existing = await adminDb.select().from(adminOptions).limit(1);

  if (existing[0]) {
    console.log('Admin options already seeded, skipping.');
    return;
  }

  const now = new Date().toISOString();
  await adminDb.insert(adminOptions).values({
    id: 1,
    minPrice: 500,
    maxPrice: 5000,
    minSize: 50,
    maxSize: 500,
    updatedAt: now,
  });

  console.log('Admin options seeded: minPrice=500, maxPrice=5000, minSize=50, maxSize=500');
}

seed().catch(console.error);