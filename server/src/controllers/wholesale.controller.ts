import type { Request, Response, NextFunction } from 'express';
import { listWholesaleInquiries, createWholesaleInquiry, setInquiryStatus, listQuotations, createQuotation, updateQuotation } from '../services/wholesale.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listWholesaleInquiriesController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listWholesaleInquiries()); } catch (e) { next(e); }
}

export async function createWholesaleInquiryController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createWholesaleInquiry(req.body); sendCreated(res, { id, ...req.body }, 'Inquiry submitted'); } catch (e) { next(e); }
}

export async function updateInquiryStatusController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await setInquiryStatus(Number(req.params.id), req.body.status), 'Status updated'); } catch (e) { next(e); }
}

export async function listQuotationsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listQuotations()); } catch (e) { next(e); }
}

export async function createQuotationController(req: Request, res: Response, next: NextFunction) {
  try { const q = await createQuotation(req.body); sendCreated(res, q, 'Quotation created'); } catch (e) { next(e); }
}

export async function updateQuotationController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateQuotation(Number(req.params.id), req.body), 'Quotation updated'); } catch (e) { next(e); }
}
