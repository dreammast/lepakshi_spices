import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '../config/database.js';
import { coupons } from '../db/schema.js';

export async function findAllCoupons() {
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function findCouponById(id: number) {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
  return coupon ?? null;
}

export async function findCouponByCode(code: string) {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
  return coupon ?? null;
}

export async function createCouponRecord(data: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string | number;
  minPurchaseAmount?: string | number;
  maxDiscountAmount?: string | number;
  usageLimit?: number;
  perCustomerLimit?: number;
  startsAt?: Date | string;
  endsAt?: Date | string;
  isActive?: boolean;
}) {
  const now = new Date();
  const [res] = await db.insert(coupons).values({
    code: data.code.toUpperCase(),
    discountType: data.discountType,
    discountValue: String(data.discountValue),
    minPurchaseAmount: data.minPurchaseAmount ? String(data.minPurchaseAmount) : '0',
    maxDiscountAmount: data.maxDiscountAmount ? String(data.maxDiscountAmount) : undefined,
    usageLimit: data.usageLimit,
    perCustomerLimit: data.perCustomerLimit,
    startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
    endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateCouponRecord(id: number, data: Record<string, any>) {
  const { id: _, createdAt: __, ...rest } = data;
  await db.update(coupons).set({ ...rest, updatedAt: new Date() }).where(eq(coupons.id, id));
  return findCouponById(id);
}

export async function deleteCouponRecord(id: number) {
  return db.delete(coupons).where(eq(coupons.id, id));
}
