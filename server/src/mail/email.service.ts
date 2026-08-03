// ---------------------------------------------------------------------------
// Reusable email service — high-level typed send methods for every flow.
// Templates live in templates.retail.ts / templates.wholesale.ts; this module
// only wires data + optional attachments and calls the transport.
// ---------------------------------------------------------------------------
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendEmailSafely, type EmailAttachment } from './send-email.js';
import { signQuoteToken } from './quote-token.js';
import { generateQuotationPdf } from './quotation-pdf.js';
import * as retailTemplates from './templates.retail.js';
import * as wholesaleTemplates from './templates.wholesale.js';
import type { RetailOrderEmailData } from './templates.retail.js';
import type { WholesaleQuotationData } from './templates.wholesale.js';
import { BRAND } from './components.js';

const API_BASE = env.API_PUBLIC_URL.replace(/\/$/, '');
const QUOTE_PUBLIC_BASE = `${API_BASE}/wholesale/quotes`;

function quoteId(id: number | string | undefined | null) {
  return String(id ?? '');
}

// ---------------------------------------------------------------------------
// Retail (B2C)
// ---------------------------------------------------------------------------

export async function sendRetailWelcome(to: string, name: string) {
  return sendEmailSafely({ to, subject: 'Welcome to Lepakshi Spices', html: retailTemplates.retailWelcomeEmail(name) });
}

export async function sendRetailLoginNotification(to: string, name: string, meta?: { ip?: string; browser?: string; time?: string }) {
  return sendEmailSafely({ to, subject: 'New sign-in to your Lepakshi Spices account', html: retailTemplates.retailLoginNotificationEmail(name, meta) });
}

export async function sendRetailOrderConfirmation(order: RetailOrderEmailData) {
  const to = order.customerEmail || '';
  if (!to) return null;
  return sendEmailSafely({
    to,
    subject: `Order confirmed: ${order.orderNumber}`,
    html: retailTemplates.retailOrderConfirmationEmail(order),
  });
}

export async function sendRetailReceipt(order: RetailOrderEmailData, customerEmail: string) {
  return sendEmailSafely({
    to: customerEmail,
    subject: `Invoice / receipt for ${order.orderNumber}`,
    html: retailTemplates.retailReceiptEmail(order),
  });
}

export async function sendRetailPaymentVerified(order: RetailOrderEmailData, customerEmail: string) {
  return sendEmailSafely({
    to: customerEmail,
    subject: `Payment Verified for Order ${order.orderNumber}`,
    html: retailTemplates.retailPaymentVerifiedEmail(order),
  });
}

export async function sendRetailOrderStatus(order: RetailOrderEmailData, customerEmail: string) {
  const status = String(order.status || '').toLowerCase();
  return sendEmailSafely({
    to: customerEmail,
    subject: `Order ${status}: ${order.orderNumber}`,
    html: retailTemplates.retailOrderStatusEmail(order),
  });
}

export async function sendRetailOrderCancelled(order: RetailOrderEmailData, customerEmail: string) {
  return sendEmailSafely({
    to: customerEmail,
    subject: `Order cancelled: ${order.orderNumber}`,
    html: retailTemplates.retailOrderCancelledEmail(order),
  });
}

export async function sendRetailPasswordReset(to: string, name: string, otp: string) {
  return sendEmailSafely({ to, subject: 'Reset Your Password - Lepakshi Spices', html: retailTemplates.retailPasswordResetEmail(name, otp) });
}

export async function sendRetailPasswordResetSuccess(to: string, name: string) {
  return sendEmailSafely({ to, subject: 'Password Reset Successful - Lepakshi Spices', html: retailTemplates.retailPasswordResetSuccessEmail(name) });
}

export async function sendRetailVerifyEmail(to: string, name: string, verificationUrl: string) {
  return sendEmailSafely({ to, subject: 'Verify Your Email - Lepakshi Spices', html: retailTemplates.retailVerifyEmailEmail(name, verificationUrl) });
}

// ---------------------------------------------------------------------------
// Wholesale (B2B)
// ---------------------------------------------------------------------------

export async function sendWholesaleEnquiryReceived(data: { contactName: string; companyName: string; email: string; productInterest?: string; volume?: string; reference?: string }) {
  return sendEmailSafely({
    to: data.email,
    subject: 'Wholesale request received - Lepakshi Spices',
    html: wholesaleTemplates.wholesaleEnquiryReceivedEmail(data),
  });
}

export async function sendWholesaleInquiryStatus(data: { contactName: string; companyName: string; email: string; status: 'approved' | 'rejected' }) {
  return sendEmailSafely({
    to: data.email,
    subject: data.status === 'approved' ? 'Wholesale request approved - Lepakshi Spices' : 'Wholesale request update - Lepakshi Spices',
    html: wholesaleTemplates.wholesaleInquiryStatusEmail(data),
  });
}

export async function sendWholesaleQuotation(quotation: WholesaleQuotationData, opts?: { attachPdf?: boolean }) {
  const id = quoteId(quotation.id);
  if (!quotation.email) {
    logger.warn({ quoteId: id }, 'Cannot send quotation email: no customer email on quotation');
    return null;
  }

  const links = {
    acceptUrl: `${QUOTE_PUBLIC_BASE}/${id}/respond?action=accept&token=${signQuoteToken(id, 'accept')}`,
    rejectUrl: `${QUOTE_PUBLIC_BASE}/${id}/respond?action=reject&token=${signQuoteToken(id, 'reject')}`,
    viewUrl: `${QUOTE_PUBLIC_BASE}/${id}/view?token=${signQuoteToken(id, 'view')}`,
  };

  let attachments: EmailAttachment[] = [];
  if (opts?.attachPdf) {
    try {
      const pdf = await generateQuotationPdf(quotation);
      attachments = [{ filename: pdf.filename, contentBase64: pdf.base64, contentType: pdf.contentType }];
    } catch (error) {
      logger.error({ err: error, quoteId: id }, 'Quotation PDF generation failed; sending HTML-only email');
    }
  }

  const ref = quotation.quoteNumber || `QT-${id}`;
  return sendEmailSafely({
    to: quotation.email,
    subject: `Your wholesale quotation ${ref} from Lepakshi Spices`,
    html: wholesaleTemplates.wholesaleQuotationEmail(quotation, links),
    attachments,
  });
}

export async function sendWholesaleQuotationUpdated(quotation: WholesaleQuotationData, opts?: { attachPdf?: boolean; summary?: string }) {
  const id = quoteId(quotation.id);
  if (!quotation.email) {
    logger.warn({ quoteId: id }, 'Cannot send quotation update email: no customer email on quotation');
    return null;
  }

  const links = {
    acceptUrl: `${QUOTE_PUBLIC_BASE}/${id}/respond?action=accept&token=${signQuoteToken(id, 'accept')}`,
    rejectUrl: `${QUOTE_PUBLIC_BASE}/${id}/respond?action=reject&token=${signQuoteToken(id, 'reject')}`,
    viewUrl: `${QUOTE_PUBLIC_BASE}/${id}/view?token=${signQuoteToken(id, 'view')}`,
  };

  let attachments: EmailAttachment[] = [];
  if (opts?.attachPdf) {
    try {
      const pdf = await generateQuotationPdf(quotation);
      attachments = [{ filename: pdf.filename, contentBase64: pdf.base64, contentType: pdf.contentType }];
    } catch (error) {
      logger.error({ err: error, quoteId: id }, 'Quotation PDF generation failed; sending HTML-only update email');
    }
  }

  const ref = quotation.quoteNumber || `QT-${id}`;
  return sendEmailSafely({
    to: quotation.email,
    subject: `Updated wholesale quotation ${ref} from Lepakshi Spices`,
    html: wholesaleTemplates.wholesaleQuotationEmail(quotation, links, { updateBanner: opts?.summary || 'The quotation has been revised by our sales team — please review the updated terms and prices.' }),
    attachments,
  });
}

export async function sendWholesaleQuotationAccepted(quotation: WholesaleQuotationData, ctx?: { orderReference?: string; paymentInstructions?: string }) {
  if (!quotation.email) return null;
  const ref = quotation.quoteNumber || `QT-${quoteId(quotation.id)}`;
  return sendEmailSafely({
    to: quotation.email,
    subject: `Quotation ${ref} Accepted - Lepakshi Spices`,
    html: wholesaleTemplates.wholesaleQuotationAcceptedEmail(quotation, ctx),
  });
}

export async function sendWholesaleQuotationRejected(quotation: WholesaleQuotationData) {
  if (!quotation.email) return null;
  const ref = quotation.quoteNumber || `QT-${quoteId(quotation.id)}`;
  return sendEmailSafely({
    to: quotation.email,
    subject: `Quotation ${ref} - Update from Lepakshi Spices`,
    html: wholesaleTemplates.wholesaleQuotationRejectedEmail(quotation),
  });
}

export async function sendWholesaleOrderConfirmation(quotation: WholesaleQuotationData, ctx?: { orderReference?: string; attachPdf?: boolean }) {
  if (!quotation.email) return null;
  const orderRef = ctx?.orderReference || `ORD-${quoteId(quotation.id)}`;

  let attachments: EmailAttachment[] = [];
  if (ctx?.attachPdf) {
    try {
      const pdf = await generateQuotationPdf(quotation);
      attachments = [{ filename: pdf.filename, contentBase64: pdf.base64, contentType: pdf.contentType }];
    } catch (error) {
      logger.error({ err: error, quoteId: quoteId(quotation.id) }, 'Order confirmation PDF attachment failed; sending HTML-only email');
    }
  }

  return sendEmailSafely({
    to: quotation.email,
    subject: `Wholesale order ${orderRef} confirmed - Lepakshi Spices`,
    html: wholesaleTemplates.wholesaleOrderConfirmationEmail(quotation, { orderReference: orderRef }),
    attachments,
  });
}

export async function sendWholesaleOrderStatus(quotation: WholesaleQuotationData, ctx?: { orderReference?: string; status?: string }) {
  if (!quotation.email) return null;
  const orderRef = ctx?.orderReference || `ORD-${quoteId(quotation.id)}`;
  const status = String(ctx?.status || quotation.status || '').toLowerCase();
  return sendEmailSafely({
    to: quotation.email,
    subject: `Wholesale order ${orderRef}: ${status} - Lepakshi Spices`,
    html: wholesaleTemplates.wholesaleOrderStatusEmail(quotation, { orderReference: orderRef, status }),
  });
}

export { BRAND };
