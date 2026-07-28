import type { Response, NextFunction } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { auditLogs, customerProfiles, orders, addresses, reviews } from '../db/schema.js';
import { sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/app-error.js';
import { findOrdersByCustomerId } from '../repositories/order.repository.js';

export async function listCustomersController(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const [customers, orderTotals] = await Promise.all([
      db.select().from(customerProfiles).orderBy(desc(customerProfiles.createdAt)),
      db.select({
        customerId: orders.customerId,
        orderCount: sql<number>`count(*)`,
        ltv: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
      }).from(orders).groupBy(orders.customerId),
    ]);
    const totalsByCustomerId = new Map(orderTotals.map(total => [total.customerId, total]));

    const enriched = customers.map(c => {
      const totals = totalsByCustomerId.get(c.id);
      const { passwordHash: _, ...safe } = c;
      return { ...safe, orderCount: Number(totals?.orderCount || 0), ltv: Number(totals?.ltv || 0) };
    });

    sendSuccess(res, enriched);
  } catch (e) { next(e); }
}

export async function getCustomerController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid customer id');
    const [customer] = await db.select().from(customerProfiles).where(eq(customerProfiles.id, id));
    if (!customer) throw new AppError(404, 'Customer not found');

    const [customerOrders, customerAddresses, customerReviews, customerAuditLogs] = await Promise.all([
      findOrdersByCustomerId(id),
      db.select().from(addresses).where(eq(addresses.customerId, id)),
      db.select().from(reviews).where(eq(reviews.customerId, id)).orderBy(desc(reviews.createdAt)),
      db.select().from(auditLogs).where(eq(auditLogs.actorCustomerId, id)).orderBy(desc(auditLogs.createdAt)).limit(50),
    ]);
    const { passwordHash: _, ...safe } = customer;
    const activity = [
      { id: `account-${customer.id}`, type: 'account_registered', occurredAt: customer.createdAt, label: 'Account registered', detail: customer.emailVerified ? 'Email address verified' : 'Account created' },
      ...customerOrders.flatMap(order => [
        { id: `order-placed-${order.id}`, type: 'order_placed', occurredAt: order.placedAt, label: 'Order placed', detail: `${order.orderNumber} — ₹${Number(order.totalAmount).toLocaleString('en-IN')}` },
        ...(order.deliveredAt ? [{ id: `order-delivered-${order.id}`, type: 'order_delivered', occurredAt: order.deliveredAt, label: 'Order delivered', detail: order.orderNumber }] : []),
      ]),
      ...customerReviews.map(review => ({ id: `review-${review.id}`, type: 'review_submitted', occurredAt: review.createdAt, label: 'Review submitted', detail: review.title || review.comment || `${review.rating}-star review` })),
      ...customerAuditLogs.map(log => ({ id: `audit-${log.id}`, type: 'account_activity', occurredAt: log.createdAt, label: log.action, detail: log.entityType ? `${log.entityType}${log.entityId ? ` #${log.entityId}` : ''}` : 'Account activity' })),
    ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    sendSuccess(res, {
      ...safe,
      orderCount: customerOrders.length,
      ltv: customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      orders: customerOrders,
      addresses: customerAddresses,
      reviews: customerReviews,
      activity,
    });
  } catch (e) { next(e); }
}

export async function updateCustomerRoleController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    await db.update(customerProfiles).set({ role, updatedAt: new Date() }).where(eq(customerProfiles.id, id));
    sendSuccess(res, { id, role }, 'Role updated');
  } catch (e) { next(e); }
}

export async function updateCustomerProfileController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, phone, email } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;

    await db.update(customerProfiles).set(updates).where(eq(customerProfiles.id, id));
    const [updated] = await db.select().from(customerProfiles).where(eq(customerProfiles.id, id));
    const { passwordHash: _, ...safe } = updated;
    sendSuccess(res, safe, 'Customer profile updated');
  } catch (e) { next(e); }
}

