import type { NextFunction, Response } from 'express';
import { createOrder, getOrder, listAdminOrders, listCustomerOrders, setOrderStatus } from '../services/order.service.js';
import { sendCreated, sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

export async function createOrderController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }
    const order = await createOrder({
      customerId: req.user.sub,
      items: req.body.items,
      shippingAddressId: req.body.shippingAddressId,
      billingAddressId: req.body.billingAddressId,
      couponCode: req.body.couponCode,
      discountAmount: req.body.discountAmount
    });
    sendCreated(res, order, 'Order placed successfully');
  } catch (error) {
    next(error);
  }
}

export async function listOrdersController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }
    const ordersList = await listCustomerOrders(req.user.sub);
    sendSuccess(res, ordersList);
  } catch (error) {
    next(error);
  }
}

export async function listAdminOrdersController(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ordersList = await listAdminOrders();
    sendSuccess(res, ordersList);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatusController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const order = await setOrderStatus(Number(req.params.id), req.body.status);
    sendSuccess(res, order, 'Order status updated');
  } catch (error) {
    next(error);
  }
}

export async function getOrderController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const order = await getOrder(Number(req.params.id));
    if (req.user && req.user.role === 'customer' && order.customerId !== req.user.sub) {
      throw new AppError(403, 'Forbidden');
    }
    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}
