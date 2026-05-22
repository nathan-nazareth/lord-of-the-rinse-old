import { db, sql } from '@lotr/db';
import { users } from '@lotr/db/schema';

export async function countAdminUsers(): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`${users.role} = 'admin'`);

  return result?.count ?? 0;
}
