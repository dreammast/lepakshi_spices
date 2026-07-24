import { findApprovedReviewsByProduct, findApprovedReviews, findAllReviews, createReviewRecord, updateReviewStatus, deleteReviewRecord, findReviewsByCustomerId, updateReviewByCustomer, deleteReviewByIdAndCustomer } from '../repositories/review.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listProductReviews(productId: number) { return findApprovedReviewsByProduct(productId); }
export async function listAllReviews() { return findAllReviews(); }
export async function listApprovedReviews() { return findApprovedReviews(); }

export async function listMyReviews(customerId: number) { return findReviewsByCustomerId(customerId); }
export async function editMyReview(id: number, customerId: number, data: Parameters<typeof updateReviewByCustomer>[2]) { return updateReviewByCustomer(id, customerId, data); }
export async function deleteMyReview(id: number, customerId: number) { return deleteReviewByIdAndCustomer(id, customerId); }

export async function createReview(data: Parameters<typeof createReviewRecord>[0]) { return createReviewRecord(data); }
export async function setReviewStatus(id: number, status: 'pending' | 'approved' | 'rejected') { return updateReviewStatus(id, status); }
export async function deleteReview(id: number) { return deleteReviewRecord(id); }

