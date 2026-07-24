import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listProductReviewsController, listAllReviewsController, createReviewController, updateReviewStatusController, deleteReviewController } from '../controllers/review.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

// Public + customer routes (mounted at /products/:id/reviews)
const productReviewRouter = Router({ mergeParams: true });
productReviewRouter.get('/', asyncHandler(listProductReviewsController));
productReviewRouter.post('/', authenticate, asyncHandler(createReviewController));

// Admin routes (mounted at /admin/reviews)
const adminReviewRouter = Router();
adminReviewRouter.use(authenticate, requireRole('admin', 'manager', 'staff'));
adminReviewRouter.get('/', asyncHandler(listAllReviewsController));
adminReviewRouter.put('/:id/status', asyncHandler(updateReviewStatusController));
adminReviewRouter.delete('/:id', asyncHandler(deleteReviewController));

export { productReviewRouter, adminReviewRouter };
