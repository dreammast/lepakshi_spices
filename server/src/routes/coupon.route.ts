import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCouponsController, createCouponController, updateCouponController, deleteCouponController, validateCouponController } from '../controllers/coupon.controller.js';

const adminRouter = Router();
adminRouter.get('/', asyncHandler(listCouponsController));
adminRouter.post('/', asyncHandler(createCouponController));
adminRouter.put('/:id', asyncHandler(updateCouponController));
adminRouter.delete('/:id', asyncHandler(deleteCouponController));

const publicRouter = Router();
publicRouter.post('/validate', asyncHandler(validateCouponController));

export { adminRouter as couponAdminRouter, publicRouter as couponPublicRouter };
