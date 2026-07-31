import type { Request, Response, NextFunction } from 'express';
import {
  listWholesaleInquiries,
  createWholesaleInquiry,
  setInquiryStatus,
  removeWholesaleInquiry,
  getInquiryWithDetails,
} from '../services/inquiry.service.js';
import { sendSuccess, sendCreated } from '../../../utils/response.util.js';

// ---------------------------------------------------------------------------
// Wholesale Inquiry Controllers
// ---------------------------------------------------------------------------

export async function listWholesaleInquiriesController(
  _req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await listWholesaleInquiries());
  } catch (e) {
    next(e);
  }
}

export async function getWholesaleInquiryController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await getInquiryWithDetails(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

export async function createWholesaleInquiryController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const id = await createWholesaleInquiry(req.body);
    sendCreated(res, { id, ...req.body }, 'Inquiry submitted');
  } catch (e) {
    next(e);
  }
}

export async function updateInquiryStatusController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await setInquiryStatus(Number(req.params.id), req.body.status), 'Status updated');
  } catch (e) {
    next(e);
  }
}

export async function deleteWholesaleInquiryController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    await removeWholesaleInquiry(Number(req.params.id));
    sendSuccess(res, null, 'Inquiry deleted');
  } catch (e) {
    next(e);
  }
}

