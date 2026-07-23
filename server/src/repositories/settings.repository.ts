import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { websiteSettings } from '../db/schema.js';

export async function findSettingByKey(key: string) {
  const [setting] = await db.select().from(websiteSettings).where(eq(websiteSettings.key, key));
  return setting ?? null;
}

export async function upsertSetting(key: string, value: string) {
  const existing = await findSettingByKey(key);
  const now = new Date();
  if (existing) {
    await db.update(websiteSettings).set({ value, updatedAt: now }).where(eq(websiteSettings.id, existing.id));
    return { ...existing, value, updatedAt: now };
  }
  const [res] = await db.insert(websiteSettings).values({ key, value, createdAt: now, updatedAt: now });
  return { id: res.insertId, key, value, createdAt: now, updatedAt: now };
}
