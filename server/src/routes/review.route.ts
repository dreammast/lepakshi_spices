import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import { listProductReviewsController, listApprovedReviewsController, listAllReviewsController, createReviewController, updateReviewStatusController, deleteReviewController, listMyReviewsController, updateMyReviewController, deleteMyReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

// Public + customer routes (mounted at /products/:id/reviews)
const productReviewRouter = Router({ mergeParams: true });
productReviewRouter.get('/', asyncHandler(listProductReviewsController));
productReviewRouter.post('/', authenticate, asyncHandler(createReviewController));

const publicReviewRouter = Router();
publicReviewRouter.get('/', asyncHandler(listApprovedReviewsController));
publicReviewRouter.get('/my', authenticate, asyncHandler(listMyReviewsController));
publicReviewRouter.put('/:id', authenticate, asyncHandler(updateMyReviewController));
publicReviewRouter.delete('/:id', authenticate, asyncHandler(deleteMyReviewController));

// Admin routes (mounted at /admin/reviews)
const adminReviewRouter = Router();
const reviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});

adminReviewRouter.get('/', asyncHandler(listAllReviewsController));
adminReviewRouter.put('/:id/status', validateBody(reviewStatusSchema), asyncHandler(updateReviewStatusController));
adminReviewRouter.delete('/:id', asyncHandler(deleteReviewController));

export { productReviewRouter, publicReviewRouter, adminReviewRouter };

