import type { Request, Response, NextFunction } from 'express';
import { listWholesaleInquiries, createWholesaleInquiry, updateWholesaleInquiry, setInquiryStatus, listQuotations, createQuotation, updateQuotation, removeWholesaleInquiry, removeQuotation, listWholesaleCatalogueData, respondToQuotation, recordQuotationView, notifyWholesaleOrderStatus, getQuotation } from '../services/wholesale.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { verifyQuoteToken } from '../mail/quote-token.js';
import { wholesaleQuotationWebPage, brandedMessagePage } from '../mail/templates.wholesale.js';
import { generateQuotationPdf } from '../mail/quotation-pdf.js';

export async function listWholesaleInquiriesController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listWholesaleInquiries()); } catch (e) { next(e); }
}

export async function createWholesaleInquiryController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createWholesaleInquiry(req.body); sendCreated(res, { id, ...req.body }, 'Inquiry submitted'); } catch (e) { next(e); }
}

export async function updateWholesaleInquiryController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateWholesaleInquiry(Number(req.params.id), req.body), 'Inquiry updated'); } catch (e) { next(e); }
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

export async function downloadQuotationPdfController(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await getQuotation(Number(req.params.id));
    const pdf = await generateQuotationPdf(q);
    const buffer = Buffer.from(pdf.base64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.filename}"`);
    res.setHeader('Content-Length', String(buffer.length));
    res.send(buffer);
  } catch (e) { next(e); }
}

export async function deleteWholesaleInquiryController(req: Request, res: Response, next: NextFunction) {
  try { await removeWholesaleInquiry(Number(req.params.id)); sendSuccess(res, null, 'Inquiry deleted'); } catch (e) { next(e); }
}

export async function deleteQuotationController(req: Request, res: Response, next: NextFunction) {
  try { await removeQuotation(Number(req.params.id)); sendSuccess(res, null, 'Quotation deleted'); } catch (e) { next(e); }
}

export async function listWholesaleCatalogueController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listWholesaleCatalogueData(), 'Wholesale catalogue data loaded'); } catch (e) { next(e); }
}

// ---------------------------------------------------------------------------
// Public quotation endpoints (signed links inside emails)
// ---------------------------------------------------------------------------

function invalidLinkPage() {
  return brandedMessagePage(
    'Invalid or expired link',
    'This link is invalid or has expired. Quotation links are valid for 14 days from the date they are issued.',
    { label: 'Contact Wholesale Team', href: `mailto:lepakshispices@gmail.com?subject=Quotation link expired` },
  );
}

function notAvailablePage() {
  return brandedMessagePage(
    'Quotation not yet available',
    'This quotation has not been released to the customer yet. Once it is approved and sent, the customer can review it here.',
    { label: 'Contact Wholesale Team', href: `mailto:lepakshispices@gmail.com?subject=Quotation status` },
  );
}

function isReleasedQuotation(quotation: any) {
  return quotation && !['draft', 'pending_approval', 'cancelled'].includes(String(quotation.status || 'draft'));
}

export async function viewQuotationController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const token = String(req.query.token || '');
    const verified = verifyQuoteToken(token);
    if (!verified || verified.id !== id || verified.action !== 'view') {
      res.status(401).send(invalidLinkPage());
      return;
    }
    const quotation = await recordQuotationView(id);
    if (!quotation) {
      res.status(404).send(invalidLinkPage());
      return;
    }
    if (!isReleasedQuotation(quotation)) {
      res.status(403).send(notAvailablePage());
      return;
    }
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(wholesaleQuotationWebPage(quotation, { viewedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) }));
  } catch (e: any) {
    res.status(e?.statusCode === 404 ? 404 : 500).send(invalidLinkPage());
  }
}

export async function respondQuotationController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const action = String(req.query.action || req.body.action || '');
    const token = String(req.query.token || '');
    const verified = verifyQuoteToken(token);
    if (!verified || verified.id !== id || verified.action !== action || (action !== 'accept' && action !== 'reject')) {
      res.status(401).send(invalidLinkPage());
      return;
    }
    const quotation = await respondToQuotation(id, action);
    if (!quotation) {
      res.status(404).send(invalidLinkPage());
      return;
    }
    if (!isReleasedQuotation(quotation)) {
      res.status(403).send(notAvailablePage());
      return;
    }
    const ref = quotation.quoteNumber || `QT-${id}`;
    if (action === 'accept') {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(brandedMessagePage(
        'Quotation Accepted',
        `Thank you ${quotation.contactPerson || 'for your business'}! Quotation ${ref} has been accepted. A confirmation email with your order reference and next steps is on its way to you.`,
        { label: 'Contact Sales', href: `mailto:lepakshispices@gmail.com?subject=${encodeURIComponent(`Order follow-up for quotation ${ref}`)}` },
      ));
    } else {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(brandedMessagePage(
        'Quotation Declined',
        `Quotation ${ref} has been marked as declined. We appreciate your time and would be glad to revisit pricing or terms in the future.`,
        { label: 'Discuss a revised quotation', href: `mailto:lepakshispices@gmail.com?subject=${encodeURIComponent(`Revised quotation request for ${ref}`)}` },
      ));
    }
  } catch (e: any) {
    res.status(e?.statusCode === 404 ? 404 : 500).send(invalidLinkPage());
  }
}

// ---------------------------------------------------------------------------
// Admin: notify a converted quotation's customer of an order status change
// ---------------------------------------------------------------------------

export async function notifyOrderStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const quotation = await notifyWholesaleOrderStatus(Number(req.params.id), req.body.status);
    sendSuccess(res, quotation, 'Wholesale order status notification sent');
  } catch (e) { next(e); }
}

export async function getQuotationController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getQuotation(Number(req.params.id))); } catch (e) { next(e); }
}
