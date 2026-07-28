import {
  createOrderRecord,
  findAllOrders,
  findOrderById,
  findOrdersByCustomerId,
  updateOrderStatus,
  type CreateOrderInput
} from '../repositories/order.repository.js';
import { AppError } from '../utils/app-error.js';
import { orders } from '../db/schema.js';
import { env } from '../config/env.js';
import { validateCoupon } from './coupon.service.js';
import { orderConfirmationEmailTemplate, orderStatusEmailTemplate, receiptEmailTemplate, sendEmailSafely } from '../mail/send-email.js';

function canEmailOrder(order: Awaited<ReturnType<typeof findOrderById>>): order is NonNullable<Awaited<ReturnType<typeof findOrderById>>> & { customerEmail: string } {
  return Boolean(order?.customerEmail);
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items?.length) {
    throw new AppError(400, 'Order must contain at least one item');
  }
  if (input.couponCode) {
    const subtotal = input.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const validated = await validateCoupon(input.couponCode, subtotal, input.customerId);
    input = { ...input, couponCode: validated.coupon.code, discountAmount: String(validated.discount) };
  } else {
    input = { ...input, discountAmount: '0' };
  }
  const order = await createOrderRecord(input);
  if (canEmailOrder(order)) {
    const orderUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/orders/${order.id}`;
    await sendEmailSafely({
      to: order.customerEmail,
      subject: `Order confirmed: ${order.orderNumber}`,
      html: orderConfirmationEmailTemplate({ ...order, trackingUrl: orderUrl, invoiceUrl: `${orderUrl}?view=invoice` }),
    });
    await sendEmailSafely({
      to: order.customerEmail,
      subject: `Invoice / receipt for ${order.orderNumber}`,
      html: receiptEmailTemplate({ ...order, trackingUrl: orderUrl, invoiceUrl: `${orderUrl}?view=invoice` }),
    });
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
  if (canEmailOrder(updated) && notificationStatus && ['shipped', 'delivered', 'cancelled'].includes(notificationStatus)) {
    const orderUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/orders/${updated.id}`;
    await sendEmailSafely({
      to: updated.customerEmail,
      subject: `Order ${notificationStatus}: ${updated.orderNumber}`,
      html: orderStatusEmailTemplate({ ...updated, trackingUrl: orderUrl }),
    });
  }
  return updated;
}
