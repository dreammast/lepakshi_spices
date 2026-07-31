import type { Request, Response, NextFunction } from 'express';
import {
  convertQuotationToOrder,
  listWholesaleOrders,
  getWholesaleOrder,
  updateWholesaleOrderStatus,
} from '../services/order.service.js';
import { sendSuccess, sendCreated } from '../../../utils/response.util.js';

// ---------------------------------------------------------------------------
// Wholesale Order Controllers
// ---------------------------------------------------------------------------

export async function convertQuotationToOrderController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const order = await convertQuotationToOrder(Number(req.body.quotationId));
    sendCreated(res, order, 'Wholesale order created from quotation');
  } catch (e) {
    next(e);
  }
}

export async function listWholesaleOrdersController(
  _req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await listWholesaleOrders());
  } catch (e) {
    next(e);
  }
}

export async function getWholesaleOrderController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await getWholesaleOrder(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

export async function updateWholesaleOrderStatusController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await updateWholesaleOrderStatus(Number(req.params.id), req.body.status), 'Order status updated');
  } catch (e) {
    next(e);
  }
}
