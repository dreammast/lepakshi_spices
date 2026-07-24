import type { Request, Response, NextFunction } from 'express';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../services/coupon.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function listCouponsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listCoupons()); } catch (e) { next(e); }
}

export async function createCouponController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createCoupon(req.body); sendCreated(res, { id, ...req.body }); } catch (e) { next(e); }
}

export async function updateCouponController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateCoupon(Number(req.params.id), req.body), 'Coupon updated'); } catch (e) { next(e); }
}

export async function deleteCouponController(req: Request, res: Response, next: NextFunction) {
  try { await deleteCoupon(Number(req.params.id)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
}

export async function validateCouponController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const customerId = req.user?.sub || req.body.customerId;
    const result = await validateCoupon(req.body.code, Number(req.body.cartTotal), customerId);
    sendSuccess(res, result);
  } catch (e) { next(e); }
}

