import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.middleware.js';
import {
  listQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  removeQuotation,
  listWholesaleCatalogueData,
  getQuotationWithRevisions,
  createRevision,
  acceptQuotation,
  listCustomerQuotations,
} from '../services/quotation.service.js';
import { generateQuotationPdf } from '../services/pdf.service.js';
import { sendSuccess, sendCreated } from '../../../utils/response.util.js';

// ---------------------------------------------------------------------------
// Wholesale Quotation Controllers
// ---------------------------------------------------------------------------

export async function listCustomerQuotationsController(
  req: AuthenticatedRequest, res: Response, next: NextFunction,
) {
  try {
    const customerId = req.user!.sub;
    sendSuccess(res, await listCustomerQuotations(customerId));
  } catch (e) {
    next(e);
  }
}

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

export async function getQuotationPdfController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const q = await getQuotation(Number(req.params.id));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Quotation_${q.quoteNumber}.pdf`);
    generateQuotationPdf(q, res);
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

