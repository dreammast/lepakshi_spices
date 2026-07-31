import type { Request, Response, NextFunction } from 'express';
import {
  listQuotations,
  createQuotation,
  updateQuotation,
  removeQuotation,
  listWholesaleCatalogueData,
  getQuotationWithRevisions,
  createRevision,
  acceptQuotation,
} from '../services/quotation.service.js';
import { sendSuccess, sendCreated } from '../../../utils/response.util.js';

// ---------------------------------------------------------------------------
// Wholesale Quotation Controllers
// ---------------------------------------------------------------------------

export async function listQuotationsController(
  _req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await listQuotations());
  } catch (e) {
    next(e);
  }
}

export async function getQuotationController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await getQuotationWithRevisions(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

export async function createQuotationController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const q = await createQuotation(req.body);
    sendCreated(res, q, 'Quotation created');
  } catch (e) {
    next(e);
  }
}

export async function createQuotationRevisionController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const revision = await createRevision(Number(req.params.id), req.body);
    sendCreated(res, revision, 'Quotation revision created successfully');
  } catch (e) {
    next(e);
  }
}

export async function acceptQuotationController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const q = await acceptQuotation(Number(req.params.id), req.body.notes);
    sendSuccess(res, q, 'Quotation accepted');
  } catch (e) {
    next(e);
  }
}

export async function updateQuotationController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await updateQuotation(Number(req.params.id), req.body), 'Quotation updated');
  } catch (e) {
    next(e);
  }
}

export async function deleteQuotationController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    await removeQuotation(Number(req.params.id));
    sendSuccess(res, null, 'Quotation deleted');
  } catch (e) {
    next(e);
  }
}

export async function listWholesaleCatalogueController(
  _req: Request, res: Response, next: NextFunction,
) {
  try {
    sendSuccess(res, await listWholesaleCatalogueData(), 'Wholesale catalogue data loaded');
  } catch (e) {
    next(e);
  }
}

