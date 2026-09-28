import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      if (displayName && existing[0].displayName !== displayName) {
        const updated = await db.update(users)
          .set({ displayName, email })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    const inserted = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: email.includes('admin') || email === 'gandivinodhini@gmail.com' ? 'admin' : 'user',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('User synchronization failed.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed for getUserByUid:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, updateData: Partial<typeof users.$inferInsert>) {
  try {
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed for updateUserProfile:', error);
    throw new Error('Failed to update user profile.', { cause: error });
  }
}
