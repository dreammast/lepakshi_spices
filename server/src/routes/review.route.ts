import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listProductReviewsController, listApprovedReviewsController, listAllReviewsController, createReviewController, updateReviewStatusController, deleteReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

// Public + customer routes (mounted at /products/:id/reviews)
const productReviewRouter = Router({ mergeParams: true });
productReviewRouter.get('/', asyncHandler(listProductReviewsController));
productReviewRouter.post('/', authenticate, asyncHandler(createReviewController));

const publicReviewRouter = Router();
publicReviewRouter.get('/', asyncHandler(listApprovedReviewsController));

// Admin routes (mounted at /admin/reviews)
const adminReviewRouter = Router();
adminReviewRouter.get('/', asyncHandler(listAllReviewsController));
adminReviewRouter.put('/:id/status', asyncHandler(updateReviewStatusController));
adminReviewRouter.delete('/:id', asyncHandler(deleteReviewController));

export { productReviewRouter, publicReviewRouter, adminReviewRouter };
