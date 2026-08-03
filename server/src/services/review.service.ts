import { findApprovedReviewsByProduct, findApprovedReviews, findAllReviews, createReviewRecord, updateReviewStatus, deleteReviewRecord, findReviewsByCustomerId, updateReviewByCustomer, deleteReviewByIdAndCustomer } from '../repositories/review.repository.js';
import { AppError } from '../utils/app-error.js';
import { emitAdmin, emitPublic, notifyAdmin } from '../realtime/events.js';

export async function listProductReviews(productId: number) { return findApprovedReviewsByProduct(productId); }
export async function listAllReviews() { return findAllReviews(); }
export async function listApprovedReviews() { return findApprovedReviews(); }

export async function listMyReviews(customerId: number) { return findReviewsByCustomerId(customerId); }
export async function editMyReview(id: number, customerId: number, data: Parameters<typeof updateReviewByCustomer>[2]) { return updateReviewByCustomer(id, customerId, data); }
export async function deleteMyReview(id: number, customerId: number) { return deleteReviewByIdAndCustomer(id, customerId); }

export async function createReview(data: Parameters<typeof createReviewRecord>[0]) {
  const reviewId = await createReviewRecord(data);
  const reviewerName = data.displayName?.trim() || 'Customer';
  const reviewRef = { reviewId, productId: data.productId ?? null, rating: data.rating ?? null, reviewerName };
  emitAdmin('review.created', { ...reviewRef, status: 'pending', at: new Date() });
  notifyAdmin('review.created', 'New Review Submitted', `${reviewerName} rated ${data.rating ?? '-'}/5 — awaiting approval`, { reviewId });
  return reviewId;
}
export async function setReviewStatus(id: number, status: 'pending' | 'approved' | 'rejected') {
  const updated = await updateReviewStatus(id, status);
  emitAdmin('review.status_changed', { reviewId: id, status, at: new Date() });
  if (status === 'approved') {
    emitPublic('review.approved', { reviewId: id, status, at: new Date() });
  }
  return updated;
}
export async function deleteReview(id: number) {
  await deleteReviewRecord(id);
  emitAdmin('review.deleted', { reviewId: id, at: new Date() });
  emitPublic('review.deleted', { reviewId: id, at: new Date() });
}

