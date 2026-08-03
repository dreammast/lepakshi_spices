import {
  createOrderRecord,
  findAllOrders,
  findOrderById,
  findOrdersByCustomerId,
  updateOrderStatus,
  verifyOrderPaymentInDb,
  appendOrderTimeline,
  type CreateOrderInput
} from '../repositories/order.repository.js';
import { AppError } from '../utils/app-error.js';
import { orders } from '../db/schema.js';
import { env } from '../config/env.js';
import { validateCoupon } from './coupon.service.js';
import { sendRetailOrderConfirmation, sendRetailOrderStatus, sendRetailReceipt, sendRetailPaymentVerified, sendRetailOrderCancelled } from '../mail/email.service.js';
import { emailLogEntry } from '../mail/email-log.js';
import { emitAdminAndUser, emitAdminAndPublic, notifyAdmin, notifyUser } from '../realtime/events.js';

function canEmailOrder(order: Awaited<ReturnType<typeof findOrderById>>): order is NonNullable<Awaited<ReturnType<typeof findOrderById>>> & { customerEmail: string } {
  return Boolean(order?.customerEmail);
}

async function safeAppendOrderTimeline(orderId: number, events: Array<{ time: string; event: string }>) {
  try {
    await appendOrderTimeline(orderId, events);
  } catch (e) {
    console.warn('[order-timeline] Failed to append order timeline event:', e);
  }
}

const ALLOWED_PAYMENT_METHODS = ['upi', 'cod'];
const COD_MINIMUM_AMOUNT = 1000;

export async function createOrder(input: CreateOrderInput) {
  if (!input.items?.length) {
    throw new AppError(400, 'Order must contain at least one item');
  }
  console.log(`[phone-flow] createOrderService: received shippingAddress.phone=${input.shippingAddress?.phone ? `"${input.shippingAddress.phone}"` : '(empty)'}`);

  // Validate payment method
  const paymentMethod = input.paymentMethod || 'upi';
  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError(400, 'Invalid payment method. Only UPI and Cash on Delivery are accepted.');
  }

  // Calculate order total for COD validation (final payable amount)
  const subtotalForValidation = input.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discountForValidation = Number(input.discountAmount || 0);
  const shippingForValidation = Number(input.shippingAmount || 0);
  const orderTotal = subtotalForValidation - discountForValidation + shippingForValidation;

  if (paymentMethod === 'cod' && orderTotal < COD_MINIMUM_AMOUNT) {
    throw new AppError(400, `Cash on Delivery is only available for orders of ₹${COD_MINIMUM_AMOUNT} or more. Your order total is ₹${orderTotal.toFixed(2)}.`);
  }

  if (paymentMethod === 'upi' && !input.upiTransactionId?.trim()) {
    throw new AppError(400, 'UPI Transaction ID (UTR) is required to complete a UPI payment.');
  }

  if (input.couponCode) {
    const subtotal = input.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const validated = await validateCoupon(input.couponCode, subtotal, input.customerId);
    input = { ...input, couponCode: validated.coupon.code, discountAmount: String(validated.discount) };
  } else {
    input = { ...input, discountAmount: '0' };
  }

  input = { ...input, paymentMethod };
  const order = await createOrderRecord(input);
  if (!order) throw new AppError(500, 'Failed to create order');

  // Real-time: new retail order (admin bell/toast) + stock changed (storefront/admin).
  const orderNumber = order.orderNumber || String(order.id);
  const orderAmount = order.total;
  emitAdminAndPublic('product.stock_changed', { source: 'order', orderId: order.id });
  notifyAdmin('order.created', 'New Order', `Order ${orderNumber} from ${order.customerName || order.customerEmail || 'customer'} for ₹${orderAmount.toLocaleString('en-IN')}`, { orderId: order.id, orderNumber });
  emitAdminAndUser('order.created', {
    orderId: order.id,
    orderNumber,
    customerId: order.customerId,
    customerEmail: order.customerEmail || null,
    status: order.status,
    paymentMethod: order.paymentMethod ?? null,
    couponCode: input.couponCode ?? null,
    total: orderAmount,
    createdAt: order.placedAt ?? new Date(),
  }, { userId: order.customerId, email: order.customerEmail || null });

  if (canEmailOrder(order)) {
    const orderUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/orders/${order.id}`;
    const emailData = { ...order, trackingUrl: orderUrl, invoiceUrl: `${orderUrl}?view=invoice` };
    const confirmation = await sendRetailOrderConfirmation(emailData);
    const receipt = await sendRetailReceipt(emailData, order.customerEmail);
    await safeAppendOrderTimeline(order.id, [
      emailLogEntry({ type: 'retail.order.confirmed', recipient: order.customerEmail, status: confirmation ? 'sent' : 'failed', messageId: confirmation?.messageId ?? null, relatedId: order.id }),
      emailLogEntry({ type: 'retail.order.receipt', recipient: order.customerEmail, status: receipt ? 'sent' : 'failed', messageId: receipt?.messageId ?? null, relatedId: order.id }),
    ]);
  }
  return order;
}

export async function listCustomerOrders(customerId: number) {
  return findOrdersByCustomerId(customerId);
}

export async function listAdminOrders() {
  return findAllOrders();
}

export async function getOrder(id: number) {
  const order = await findOrderById(id);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  return order;
}

export async function setOrderStatus(id: number, status: typeof orders.$inferInsert.status) {
  const order = await findOrderById(id);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  if (order.status === status) return order;
  const updated = await updateOrderStatus(id, status);
  if (!updated) {
    throw new AppError(404, 'Order not found');
  }
  const notificationStatus = status ?? updated.status;

  // Real-time: push the new status to admins + the order's customer.
  const orderNumber = updated.orderNumber || String(updated.id);
  emitAdminAndUser('order.status_changed', {
    orderId: updated.id,
    orderNumber,
    status: notificationStatus,
    previousStatus: order.status,
    customerId: updated.customerId,
    customerEmail: updated.customerEmail ?? null,
    updatedAt: new Date(),
  }, { userId: updated.customerId, email: updated.customerEmail });
  notifyAdmin('order.status_changed', 'Order Status Updated', `Order ${orderNumber} → ${notificationStatus}`);
  notifyUser('order.status_changed', 'Order Status Updated', `Your order ${orderNumber} is now ${notificationStatus}`, {
    userId: updated.customerId,
    email: updated.customerEmail,
    meta: { orderId: updated.id, status: notificationStatus },
  });

  if (canEmailOrder(updated) && notificationStatus && ['processing', 'shipped', 'delivered', 'cancelled'].includes(notificationStatus)) {
    const orderUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/orders/${updated.id}`;
    const result = notificationStatus === 'cancelled'
      ? await sendRetailOrderCancelled({ ...updated, trackingUrl: orderUrl }, updated.customerEmail)
      : await sendRetailOrderStatus({ ...updated, trackingUrl: orderUrl }, updated.customerEmail);
    await safeAppendOrderTimeline(updated.id, [
      emailLogEntry({ type: `retail.order.${notificationStatus}`, recipient: updated.customerEmail, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: updated.id }),
    ]);
  }
  return updated;
}

export async function verifyOrderPayment(id: number, adminName: string) {
  const order = await findOrderById(id);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  if (order.paymentStatus === 'verified') {
    return order;
  }
  const updated = await verifyOrderPaymentInDb(id, adminName);
  if (!updated) {
    throw new AppError(404, 'Order not found');
  }

  // Real-time: payment verified notification for admins + customer.
  const orderNumber = updated.orderNumber || String(updated.id);
  emitAdminAndUser('order.payment_verified', {
    orderId: updated.id,
    orderNumber,
    paymentStatus: 'verified',
    customerId: updated.customerId,
    customerEmail: updated.customerEmail ?? null,
    verifiedBy: adminName,
    updatedAt: new Date(),
  }, { userId: updated.customerId, email: updated.customerEmail });
  notifyAdmin('order.payment_verified', 'Payment Verified', `Payment for order ${orderNumber} verified by ${adminName}`);
  notifyUser('order.payment_verified', 'Payment Verified', `Your payment for order ${orderNumber} has been verified`, {
    userId: updated.customerId,
    email: updated.customerEmail,
    meta: { orderId: updated.id },
  });

  if (canEmailOrder(updated)) {
    const orderUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/orders/${updated.id}`;
    const result = await sendRetailPaymentVerified({ ...updated, trackingUrl: orderUrl }, updated.customerEmail);
    await safeAppendOrderTimeline(updated.id, [
      emailLogEntry({ type: 'retail.order.payment_verified', recipient: updated.customerEmail, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: updated.id }),
    ]);
  }
  return updated;
}

