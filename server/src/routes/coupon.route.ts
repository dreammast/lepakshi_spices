import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCouponsController, createCouponController, updateCouponController, deleteCouponController, validateCouponController } from '../controllers/coupon.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const adminRouter = Router();
adminRouter.use(authenticate, requireRole('admin', 'manager', 'staff'));
adminRouter.get('/', asyncHandler(listCouponsController));
adminRouter.post('/', asyncHandler(createCouponController));
adminRouter.put('/:id', asyncHandler(updateCouponController));
adminRouter.delete('/:id', asyncHandler(deleteCouponController));

const publicRouter = Router();
publicRouter.post('/validate', authenticate, asyncHandler(validateCouponController));

export { adminRouter as couponAdminRouter, publicRouter as couponPublicRouter };
