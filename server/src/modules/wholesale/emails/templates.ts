import { emailLayout, escapeHtml } from '../../../mail/send-email.js';

// ---------------------------------------------------------------------------
// Wholesale-specific email templates
//
// All wholesale email HTML generation lives here. Reuses the shared
// emailLayout() and escapeHtml() helpers from the common mail module.
// ---------------------------------------------------------------------------

function formatMoney(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

/**
 * Email sent when a wholesale inquiry is received, approved, or rejected.
 */
export function wholesaleInquiryEmailTemplate(
  contactName: string,
  companyName: string,
  status: 'received' | 'approved' | 'rejected',
) {
  const copy =
    status === 'received'
      ? 'We have received your wholesale request and will review it shortly.'
      : status === 'approved'
        ? 'Your wholesale request has been approved. Our team will contact you with the next steps.'
        : 'Thank you for your interest. We are unable to approve your wholesale request at this time.';

  const title =
    status === 'received'
      ? 'Wholesale request received'
      : status === 'approved'
        ? 'Wholesale request approved'
        : 'Wholesale request rejected';

  return emailLayout(
    title,
    `<p>Hi ${escapeHtml(contactName)},</p><p>${copy}</p><p>Company: <strong>${escapeHtml(companyName)}</strong></p>`,
  );
}

/**
 * Email sent when a quotation is generated and sent to a B2B customer.
 */
export function quotationSentEmailTemplate(
  contactName: string,
  companyName: string,
  quoteNumber: string,
) {
  return emailLayout(
    'New Quotation Prepared',
    `<p>Hi ${escapeHtml(contactName)},</p>
     <p>We have prepared a new quotation <strong>${escapeHtml(quoteNumber)}</strong> for <strong>${escapeHtml(companyName)}</strong>.</p>
     <p>Our team has reviewed your inquiry and populated the catalog item pricing. Please review and accept the quotation or get in touch for revisions.</p>`,
  );
}

/**
 * Confirmation when a quotation is accepted.
 */
export function quotationAcceptedEmailTemplate(
  contactName: string,
  companyName: string,
  quoteNumber: string,
) {
  return emailLayout(
    'Quotation Accepted',
    `<p>Hi ${escapeHtml(contactName)},</p>
     <p>Thank you for accepting quotation <strong>${escapeHtml(quoteNumber)}</strong> for <strong>${escapeHtml(companyName)}</strong>.</p>
     <p>We are initiating the wholesale order placement process. You will receive order details shortly.</p>`,
  );
}

/**
 * Email sent when a wholesale order is placed/confirmed.
 */
export function wholesaleOrderConfirmationTemplate(
  contactName: string,
  companyName: string,
  orderNumber: string,
  totalAmount: number,
) {
  return emailLayout(
    'Wholesale Order Placed',
    `<p>Hi ${escapeHtml(contactName)},</p>
     <p>Your wholesale order <strong>${escapeHtml(orderNumber)}</strong> for <strong>${escapeHtml(companyName)}</strong> has been successfully created from your accepted quotation.</p>
     <p><strong>Total Order Amount:</strong> ${escapeHtml(formatMoney(totalAmount))}</p>
     <p>Our processing team is preparing your wholesale packaging and scheduling dispatch. We will notify you once dispatched.</p>`,
  );
}

/**
 * Status update email for wholesale orders.
 */
export function wholesaleOrderStatusTemplate(
  contactName: string,
  companyName: string,
  orderNumber: string,
  status: string,
) {
  const message = status === 'shipped'
    ? 'has been shipped and is on its way to your destination.'
    : status === 'delivered'
      ? 'has been successfully delivered.'
      : status === 'cancelled'
        ? 'has been cancelled.'
        : `has transitioned to state: <strong>${escapeHtml(status)}</strong>.`;

  return emailLayout(
    `Wholesale Order Update: ${status.toUpperCase()}`,
    `<p>Hi ${escapeHtml(contactName)},</p>
     <p>Your wholesale order <strong>${escapeHtml(orderNumber)}</strong> for <strong>${escapeHtml(companyName)}</strong> ${message}</p>`,
  );
}

/**
 * Invoice sent to B2B customers.
 */
export function invoiceSentEmailTemplate(
  contactName: string,
  companyName: string,
  invoiceNumber: string,
  totalAmount: number,
  dueDate: string,
) {
  return emailLayout(
    'Wholesale Invoice Issued',
    `<p>Hi ${escapeHtml(contactName)},</p>
     <p>We have issued invoice <strong>${escapeHtml(invoiceNumber)}</strong> for <strong>${escapeHtml(companyName)}</strong>.</p>
     <p><strong>Amount Due:</strong> ${escapeHtml(formatMoney(totalAmount))}</p>
     <p><strong>Due Date:</strong> ${escapeHtml(dueDate)}</p>
     <p>Please complete payment according to the agreed terms. Thank you for your business!</p>`,
  );
}

/**
 * Payment confirmation receipt.
 */
export function invoicePaidEmailTemplate(
  contactName: string,
  companyName: string,
  invoiceNumber: string,
) {
  return emailLayout(
    'Wholesale Payment Received',
    `<p>Hi ${escapeHtml(contactName)},</p>
     <p>We have received and verified the payment for invoice <strong>${escapeHtml(invoiceNumber)}</strong> (<strong>${escapeHtml(companyName)}</strong>).</p>
     <p>Thank you for your prompt payment.</p>`,
  );
}
