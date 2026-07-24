import type { Request, Response, NextFunction } from 'express';
import { listProductReviews, listApprovedReviews, listAllReviews, createReview, setReviewStatus, deleteReview } from '../services/review.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

export async function listProductReviewsController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listProductReviews(Number(req.params.id))); } catch (e) { next(e); }
}

export async function listAllReviewsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listAllReviews()); } catch (e) { next(e); }
}

export async function listApprovedReviewsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listApprovedReviews()); } catch (e) { next(e); }
}

export async function createReviewController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const id = await createReview({
      productId: Number(req.params.id),
      customerId: req.user.sub,
      rating: req.body.rating,
      title: req.body.title,
      displayName: req.body.displayName,
      comment: req.body.comment
    });
    sendCreated(res, { id }, 'Review submitted for moderation');
  } catch (e) { next(e); }
}

export async function updateReviewStatusController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await setReviewStatus(Number(req.params.id), req.body.status), 'Review status updated'); } catch (e) { next(e); }
}

export async function deleteReviewController(req: Request, res: Response, next: NextFunction) {
  try { await deleteReview(Number(req.params.id)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
}
