import { findApprovedReviewsByProduct, findAllReviews, createReviewRecord, updateReviewStatus, deleteReviewRecord } from '../repositories/review.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listProductReviews(productId: number) { return findApprovedReviewsByProduct(productId); }
export async function listAllReviews() { return findAllReviews(); }

export async function createReview(data: Parameters<typeof createReviewRecord>[0]) { return createReviewRecord(data); }
export async function setReviewStatus(id: number, status: 'pending' | 'approved' | 'rejected') { return updateReviewStatus(id, status); }
export async function deleteReview(id: number) { return deleteReviewRecord(id); }
