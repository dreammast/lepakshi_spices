import { findAllCoupons, findCouponById, findCouponByCode, findCouponsByCodes, createCouponRecord, updateCouponRecord, deleteCouponRecord } from '../repositories/coupon.repository.js';
import { AppError } from '../utils/app-error.js';
import { db } from '../config/database.js';
import { orders } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export async function listCoupons() { return findAllCoupons(); }

export async function getCoupon(id: number) {
  const c = await findCouponById(id);
  if (!c) throw new AppError(404, 'Coupon not found');
  return c;
}

export async function createCoupon(data: Parameters<typeof createCouponRecord>[0]) { return createCouponRecord(data); }
export async function updateCoupon(id: number, data: Record<string, any>) { return updateCouponRecord(id, data); }
export async function deleteCoupon(id: number) { return deleteCouponRecord(id); }

export async function listAvailableCoupons(customerId: number) {
  const customerOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.customerId, customerId));
  const coupons = await findAllCoupons();
  const usedCodes = new Set((await db.select({ couponCode: orders.couponCode }).from(orders).where(eq(orders.customerId, customerId)))
    .map(row => row.couponCode?.toUpperCase()).filter(Boolean));
  const eligible = customerOrders.length === 0
    ? coupons.filter(c => c.code === 'WELCOME30')
    : coupons.filter(c => c.code !== 'WELCOME30' && !usedCodes.has(c.code.toUpperCase()));
  return eligible.filter(c => c.isActive);
}

export async function validateCoupon(code: string, cartTotal: number, customerId?: number) {
  const normalizedCode = String(code ?? '').trim().toUpperCase();
  const total = Number(cartTotal);
  if (!normalizedCode) throw new AppError(400, 'Coupon code is required');
  if (!Number.isFinite(total) || total < 0) throw new AppError(400, 'Cart total is invalid');
  const coupon = await findCouponByCode(normalizedCode);
  if (!coupon) throw new AppError(404, 'Coupon not found');
  if (!coupon.isActive) throw new AppError(400, 'Coupon is inactive');

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new AppError(400, 'Coupon is not yet active');
  if (coupon.endsAt && coupon.endsAt < now) throw new AppError(400, 'Coupon has expired');

  if (customerId) {
    const customerOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.customerId, customerId));
    if (customerOrders.length === 0 && normalizedCode !== 'WELCOME30') {
      throw new AppError(400, 'New customers can only use WELCOME30');
    }
    if (customerOrders.length > 0 && normalizedCode === 'WELCOME30') {
      throw new AppError(400, 'WELCOME30 is only available on your first order');
    }
    const existingOrders = await db.select().from(orders).where(and(eq(orders.customerId, customerId), eq(orders.couponCode, normalizedCode)));
    if (existingOrders.length > 0) throw new AppError(400, 'You have already used this coupon code');
  }

  const minPurchase = Number(coupon.minPurchaseAmount);
  if (total < minPurchase) throw new AppError(400, `Minimum purchase amount is ₹${minPurchase}`);

  let discount = coupon.discountType === 'percentage'
    ? total * (Number(coupon.discountValue) / 100)
    : Number(coupon.discountValue);

  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  }

  return { valid: true, discount: Math.round(discount * 100) / 100, coupon };
}

