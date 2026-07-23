import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { addresses } from '../db/schema.js';

export async function findAddressesByCustomerId(customerId: number) {
  return db.select().from(addresses).where(eq(addresses.customerId, customerId));
}

export async function createAddressRecord(customerId: number, data: {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}) {
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false, updatedAt: new Date() }).where(eq(addresses.customerId, customerId));
  }

  const now = new Date();
  const [res] = await db.insert(addresses).values({
    customerId,
    label: data.label,
    line1: data.line1,
    line2: data.line2,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    isDefault: data.isDefault ?? false,
    createdAt: now,
    updatedAt: now
  });

  const [created] = await db.select().from(addresses).where(eq(addresses.id, res.insertId));
  return created;
}

export async function updateAddressRecord(customerId: number, id: number, data: Partial<{
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}>) {
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false, updatedAt: new Date() }).where(eq(addresses.customerId, customerId));
  }

  await db.update(addresses).set({ ...data, updatedAt: new Date() }).where(and(eq(addresses.id, id), eq(addresses.customerId, customerId)));
  const [updated] = await db.select().from(addresses).where(eq(addresses.id, id));
  return updated ?? null;
}

export async function deleteAddressRecord(customerId: number, id: number) {
  return db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.customerId, customerId)));
}
