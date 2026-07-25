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
import { validateCoupon } from './coupon.service.js';

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
  return createOrderRecord(input);
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
  return updateOrderStatus(id, status);
}
