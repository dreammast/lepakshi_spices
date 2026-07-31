import type { Request, Response, NextFunction } from 'express';
import {
  generateInvoiceFromOrder,
  listInvoices,
  getInvoice,
  updateInvoiceStatus,
} from '../services/invoice.service.js';
import { sendSuccess, sendCreated } from '../../../utils/response.util.js';

// ---------------------------------------------------------------------------
// Wholesale Invoice Controllers
// ---------------------------------------------------------------------------

export async function generateInvoiceController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const invoice = await generateInvoiceFromOrder(
      Number(req.body.wholesaleOrderId),
      req.body.dueDate,
      req.body.notes,
    );
    sendCreated(res, invoice, 'Invoice generated successfully');
  } catch (e) {
    next(e);
  }
}

export async function listInvoicesController(
  _req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await listInvoices());
  } catch (e) {
    next(e);
  }
}

export async function getInvoiceController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await getInvoice(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

export async function updateInvoiceStatusController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await updateInvoiceStatus(Number(req.params.id), req.body.status), 'Invoice status updated');
  } catch (e) {
    next(e);
  }
}
