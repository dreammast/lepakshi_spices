import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { collections, collectionProducts, products } from '../db/schema.js';

export async function findAllCollections() {
  return db.select().from(collections).orderBy(collections.sortOrder);
}

export async function findCollectionBySlug(slug: string) {
  const [collection] = await db.select().from(collections).where(eq(collections.slug, slug));
  if (!collection) return null;

  const members = await db
    .select({ product: products, sortOrder: collectionProducts.sortOrder })
    .from(collectionProducts)
    .leftJoin(products, eq(collectionProducts.productId, products.id))
    .where(eq(collectionProducts.collectionId, collection.id))
    .orderBy(collectionProducts.sortOrder);

  return { ...collection, products: members.map(m => ({ ...m.product, sortOrder: m.sortOrder })) };
}

export async function createCollectionRecord(data: { name: string; slug: string; description?: string; imageUrl?: string; isActive?: boolean; sortOrder?: number }) {
  const now = new Date();
  const [res] = await db.insert(collections).values({
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description,
    imageUrl: data.imageUrl,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateCollectionRecord(id: number, data: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean; sortOrder: number }>) {
  await db.update(collections).set({ ...data, updatedAt: new Date() }).where(eq(collections.id, id));
  const [updated] = await db.select().from(collections).where(eq(collections.id, id));
  return updated ?? null;
}

export async function deleteCollectionRecord(id: number) {
  await db.delete(collectionProducts).where(eq(collectionProducts.collectionId, id));
  return db.delete(collections).where(eq(collections.id, id));
}

export async function replaceCollectionProducts(collectionId: number, productIds: number[]) {
  await db.delete(collectionProducts).where(eq(collectionProducts.collectionId, collectionId));
  if (productIds.length > 0) {
    await db.insert(collectionProducts).values(
      productIds.map((pid, idx) => ({ collectionId, productId: pid, sortOrder: idx }))
    );
  }
  return findCollectionBySlug('');
}
