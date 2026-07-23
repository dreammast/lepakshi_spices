import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { bulkPackaging } from '../db/schema.js';

export async function findPackagingByProduct(productId: number) {
  return db.select().from(bulkPackaging).where(eq(bulkPackaging.productId, productId)).orderBy(bulkPackaging.packLabel);
}

export async function findPackagingById(id: number) {
  const [pkg] = await db.select().from(bulkPackaging).where(eq(bulkPackaging.id, id));
  return pkg ?? null;
}

export async function createPackagingRecord(productId: number, data: {
  packLabel: string;
  price: string | number;
  minOrderQty?: number;
  isActive?: boolean;
}) {
  const now = new Date();
  const [res] = await db.insert(bulkPackaging).values({
    productId,
    packLabel: data.packLabel,
    price: String(data.price),
    minOrderQty: data.minOrderQty ?? 1,
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updatePackagingRecord(id: number, data: Record<string, any>) {
  const { id: _, createdAt: __, ...rest } = data;
  if (rest.price !== undefined) rest.price = String(rest.price);
  await db.update(bulkPackaging).set({ ...rest, updatedAt: new Date() }).where(eq(bulkPackaging.id, id));
  return findPackagingById(id);
}

export async function deletePackagingRecord(id: number) {
  return db.delete(bulkPackaging).where(eq(bulkPackaging.id, id));
}
