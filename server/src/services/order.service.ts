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

export async function createOrder(input: CreateOrderInput) {
  if (!input.items?.length) {
    throw new AppError(400, 'Order must contain at least one item');
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
