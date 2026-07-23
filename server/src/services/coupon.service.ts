import { findAllCoupons, findCouponById, findCouponByCode, createCouponRecord, updateCouponRecord, deleteCouponRecord } from '../repositories/coupon.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listCoupons() { return findAllCoupons(); }

export async function getCoupon(id: number) {
  const c = await findCouponById(id);
  if (!c) throw new AppError(404, 'Coupon not found');
  return c;
}

export async function createCoupon(data: Parameters<typeof createCouponRecord>[0]) { return createCouponRecord(data); }
export async function updateCoupon(id: number, data: Record<string, any>) { return updateCouponRecord(id, data); }
export async function deleteCoupon(id: number) { return deleteCouponRecord(id); }

export async function validateCoupon(code: string, cartTotal: number) {
  const coupon = await findCouponByCode(code);
  if (!coupon) throw new AppError(404, 'Coupon not found');
  if (!coupon.isActive) throw new AppError(400, 'Coupon is inactive');

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new AppError(400, 'Coupon is not yet active');
  if (coupon.endsAt && coupon.endsAt < now) throw new AppError(400, 'Coupon has expired');

  const minPurchase = Number(coupon.minPurchaseAmount);
  if (cartTotal < minPurchase) throw new AppError(400, `Minimum purchase amount is ₹${minPurchase}`);

  let discount = coupon.discountType === 'percentage'
    ? cartTotal * (Number(coupon.discountValue) / 100)
    : Number(coupon.discountValue);

  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  }

  return { valid: true, discount: Math.round(discount * 100) / 100, coupon };
}
