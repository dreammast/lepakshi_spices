import { eq, desc, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { reviews, products, customerProfiles } from '../db/schema.js';

export async function findApprovedReviewsByProduct(productId: number) {
  return db
    .select({ review: reviews, customer: customerProfiles })
    .from(reviews)
    .leftJoin(customerProfiles, eq(reviews.customerId, customerProfiles.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.status, 'approved')))
    .orderBy(desc(reviews.createdAt));
}

export async function findAllReviews() {
  return db
    .select({ review: reviews, product: products, customer: customerProfiles })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(customerProfiles, eq(reviews.customerId, customerProfiles.id))
    .orderBy(desc(reviews.createdAt));
}

export async function findApprovedReviews() {
  return db
    .select({ review: reviews, product: products, customer: customerProfiles })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(customerProfiles, eq(reviews.customerId, customerProfiles.id))
    .where(eq(reviews.status, 'approved'))
    .orderBy(desc(reviews.approvedAt));
}

export async function findReviewById(id: number) {
  const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
  return review ?? null;
}

export async function createReviewRecord(data: {
  productId: number;
  customerId: number;
  rating: number;
  title?: string;
  displayName?: string;
  comment?: string;
}) {
  const now = new Date();
  const [res] = await db.insert(reviews).values({
    productId: data.productId,
    customerId: data.customerId,
    rating: data.rating,
    title: data.title,
    displayName: data.displayName,
    comment: data.comment,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateReviewStatus(id: number, status: 'pending' | 'approved' | 'rejected') {
  const updates: Record<string, any> = { status, updatedAt: new Date() };
  if (status === 'approved') updates.approvedAt = new Date();
  await db.update(reviews).set(updates).where(eq(reviews.id, id));
  return findReviewById(id);
}

export async function deleteReviewRecord(id: number) {
  return db.delete(reviews).where(eq(reviews.id, id));
}
