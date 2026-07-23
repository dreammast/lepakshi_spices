import { eq, type InferModel } from 'drizzle-orm';
import { db } from '../config/database.js';
import { categories } from '../db/schema.js';

export type CategoryRecord = InferModel<typeof categories>;

export async function findAllCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function findCategoryBySlug(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
  return category ?? null;
}

export async function createCategoryRecord(data: { name: string; slug: string; description?: string }) {
  const [res] = await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return res.insertId;
}

export async function deleteCategoryRecord(id: number) {
  return db.delete(categories).where(eq(categories.id, id));
}

export async function updateCategoryRecord(id: number, data: { name?: string; slug?: string; description?: string }) {
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
  const [updated] = await db.select().from(categories).where(eq(categories.id, id));
  return updated ?? null;
}


