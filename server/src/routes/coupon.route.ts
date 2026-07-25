import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCouponsController, listAvailableCouponsController, createCouponController, updateCouponController, deleteCouponController, validateCouponController } from '../controllers/coupon.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const adminRouter = Router();
adminRouter.get('/', asyncHandler(listCouponsController));
adminRouter.post('/', asyncHandler(createCouponController));
adminRouter.put('/:id', asyncHandler(updateCouponController));
adminRouter.delete('/:id', asyncHandler(deleteCouponController));

const publicRouter = Router();
publicRouter.get('/available', authenticate, asyncHandler(listAvailableCouponsController));
publicRouter.post('/validate', optionalAuthenticate, asyncHandler(validateCouponController));

export { adminRouter as couponAdminRouter, publicRouter as couponPublicRouter };

