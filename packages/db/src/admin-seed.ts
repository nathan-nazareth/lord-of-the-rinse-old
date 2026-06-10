import { adminDb, adminOptions, adminClient } from './admin';

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

const isMainModule =
  typeof import.meta !== 'undefined' &&
  typeof process !== 'undefined' &&
  import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  seed()
    .catch((err) => {
      console.error('[admin-seed] failed:', err);
      process.exitCode = 1;
    })
    .finally(() => {
      try {
        adminClient.close();
      } catch {
        // ignore
      }
    });
}