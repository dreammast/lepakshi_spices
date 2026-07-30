import { desc, eq, sql, type InferModel } from 'drizzle-orm';
import { db } from '../config/database.js';
import { categories, productImages, products } from '../db/schema.js';

export type CategoryRecord = InferModel<typeof categories>;

export async function findAllCategories() {
  const cats = await db.select().from(categories).orderBy(categories.name);

  // Active product count per category
  const counts = await db
    .select({
      categoryId: products.categoryId,
      count: sql<number>`count(*)`,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .groupBy(products.categoryId);

  const countMap = new Map<number, number>();
  for (const row of counts) {
    countMap.set(row.categoryId, row.count);
  }

  // Most recent active product's primary image per category
  const productsWithImages = await db
    .select({
      categoryId: products.categoryId,
      imageUrl: productImages.url,
      isPrimary: productImages.isPrimary,
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt), desc(productImages.isPrimary));

  const categoryImageMap = new Map<number, string>();
  const seenCategories = new Set<number>();
  for (const row of productsWithImages) {
    if (!seenCategories.has(row.categoryId)) {
      seenCategories.add(row.categoryId);
      if (row.imageUrl) {
        categoryImageMap.set(row.categoryId, row.imageUrl);
      }
    }
  }

  return cats.map(cat => ({
    ...cat,
    imageUrl: categoryImageMap.get(cat.id) || null,
    count: countMap.get(cat.id) || 0,
  }));
}

export async function findCategoryBySlug(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
  return category ?? null;
}

export async function createCategoryRecord(data: { name: string; slug: string; description?: string; imageUrl?: string }) {
  const [res] = await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
    description: data.description,
    imageUrl: data.imageUrl,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return res.insertId;
}

export async function deleteCategoryRecord(id: number) {
  return db.delete(categories).where(eq(categories.id, id));
}

export async function updateCategoryRecord(id: number, data: { name?: string; slug?: string; description?: string; imageUrl?: string }) {
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
  const [updated] = await db.select().from(categories).where(eq(categories.id, id));
  return updated ?? null;
}


