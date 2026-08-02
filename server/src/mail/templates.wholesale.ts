// ---------------------------------------------------------------------------
// Wholesale (B2B) email templates — composed from shared components.
// Quotation is rendered inline in the email (with optional PDF attachment).
// ---------------------------------------------------------------------------
import {
  emailLayout,
  heading,
  paragraph,
  buttonPrimary,
  buttonSecondary,
  buttonRow,
  keyValueTable,
  sectionTitle,
  quotationItemsTable,
  quotationTotalsBlock,
  commercialTermsBlock,
  successNotice,
  infoBlock,
  mutedNote,
  smallDivider,
  escapeHtml,
  formatDate,
  BRAND,
  COLORS,
  type QuotationEmailItem,
  type QuotationTotals,
} from './components.js';

export type WholesaleQuotationData = {
  id?: number | string;
  quoteNumber?: string | null;
  inquiryId?: number | string | null;
  businessName?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  gstin?: string | null;
  salesExecutive?: string | null;
  discountType?: 'percentage' | 'flat' | string | null;
  discountValue?: number | string | null;
  shippingCharges?: number | string | null;
  subtotalAmount?: number | string | null;
  discountAmount?: number | string | null;
  shippingAmount?: number | string | null;
  payableAmount?: number | string | null;
  totalAmount?: number | string | null;
  currency?: string | null;
  paymentTerms?: string | null;
  leadTimeDays?: number | string | null;
  packagingType?: string | null;
  deliveryMethod?: string | null;
  notes?: string | null;
  termsList?: string[] | null;
  validUntil?: string | Date | null;
  status?: string | null;
  version?: number | string | null;
  approvedAt?: string | Date | null;
  emailSentAt?: string | Date | null;
  emailSentBy?: string | null;
  emailSentVersion?: number | string | null;
  createdAt?: string | Date | null;
  items?: Array<QuotationEmailItem>;
};

function quoteReference(data: WholesaleQuotationData) {
  return data.quoteNumber || `QT-${data.id}`;
}

function quoteCustomerCard(data: WholesaleQuotationData) {
  return `<div style="background-color:#FAF8F5;border-radius:12px;padding:20px;margin:18px 0;border:1px solid rgba(26,23,20,0.08);text-align:left;">
    ${keyValueTable([
      { label: 'Company', value: escapeHtml(data.businessName || '—') },
      { label: 'Contact Person', value: escapeHtml(data.contactPerson || '—') },
      { label: 'Email', value: escapeHtml(data.email || '—') },
      { label: 'Phone', value: escapeHtml(data.phone ? `+91 ${data.phone}` : '—') },
      ...(data.gstin ? [{ label: 'GSTIN', value: escapeHtml(data.gstin) }] : []),
      { label: 'Quotation No.', value: `<span style="font-family:monospace;font-weight:700;">${escapeHtml(quoteReference(data))}</span>` },
      { label: 'Version', value: escapeHtml(data.version ? `v${data.version}` : '—') },
      { label: 'Valid Until', value: escapeHtml(formatDate(data.validUntil)) },
      { label: 'Prepared By', value: escapeHtml(data.salesExecutive || 'Lepakshi Spices Sales Team') },
    ])}
  </div>`;
}

function quoteCommercialTerms(data: WholesaleQuotationData) {
  const rows = [
    { label: 'Payment Terms', value: escapeHtml(data.paymentTerms || '—') },
    { label: 'Lead Time', value: data.leadTimeDays != null ? `${escapeHtml(String(data.leadTimeDays))} days` : '—' },
    { label: 'Packaging', value: escapeHtml(data.packagingType || '—') },
    { label: 'Delivery Method', value: escapeHtml(data.deliveryMethod || '—') },
    { label: 'Billing Address', value: escapeHtml(data.billingAddress || '—') },
    { label: 'Shipping Address', value: escapeHtml(data.shippingAddress || '—') },
  ];
  return commercialTermsBlock(rows);
}

function quoteTermsList(data: WholesaleQuotationData) {
  const terms = data.termsList || [];
  if (!terms.length) return '';
  return `<ul style="color:#3d3832;font-size:13px;line-height:1.8;margin:8px 0 0;padding-left:18px;">
    ${terms.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
  </ul>`;
}

function quoteNotes(data: WholesaleQuotationData) {
  if (!data.notes) return '';
  return `<p style="color:#3d3832;font-size:13px;line-height:1.7;margin:8px 0 0;">${escapeHtml(data.notes)}</p>`;
}

export function wholesaleEnquiryReceivedEmail(data: { contactName: string; companyName: string; productInterest?: string; volume?: string; reference?: string }) {
  const html = `
    ${heading('We received your wholesale enquiry')}
    ${paragraph(`Hi ${escapeHtml(data.contactName)},`)}
    ${paragraph(`Thank you for reaching out to <strong>${escapeHtml(BRAND.name)}</strong>. Our wholesale team has received your enquiry${data.companyName ? ` from <strong>${escapeHtml(data.companyName)}</strong>` : ''} and will review it shortly.`)}
    <div style="background-color:#FAF8F5;border-radius:12px;padding:20px;margin:18px 0;border:1px solid rgba(26,23,20,0.08);text-align:left;">
      ${keyValueTable([
        { label: 'Product Interest', value: escapeHtml(data.productInterest || '—') },
        { label: 'Order Volume', value: escapeHtml(data.volume || '—') },
        ...(data.reference ? [{ label: 'Reference', value: escapeHtml(data.reference) }] : []),
      ])}
    </div>
    ${paragraph(`A sales executive will contact you within <strong>1 business day</strong> with product samples, pricing and dispatch details.`)}
    ${buttonRow(buttonPrimary(`${BRAND.storefrontUrl}`, 'View our catalogue'))}
    ${mutedNote('You can reach our wholesale desk directly anytime — reply to this email or WhatsApp us.')}
  `;
  return emailLayout('Wholesale enquiry received', html);
}

export function wholesaleInquiryStatusEmail(data: { contactName: string; companyName: string; status: 'approved' | 'rejected' }) {
  const approved = data.status === 'approved';
  const title = approved ? 'Wholesale request approved' : 'Wholesale request update';
  const html = `
    ${heading(title)}
    ${paragraph(`Hi ${escapeHtml(data.contactName)},`)}
    ${approved
      ? successNotice('Request Approved', 'Congratulations! Your wholesale request with Lepakshi Spices has been approved. Our sales team will contact you shortly with product samples, pricing and the next steps.')
      : paragraph('Thank you for your interest in sourcing spices from Lepakshi Spices. Unfortunately, we are unable to approve your wholesale request at this time.')}
    ${paragraph(`Company: <strong>${escapeHtml(data.companyName)}</strong>`)}
    ${mutedNote(`For any questions, reply to this email or contact us on WhatsApp at ${escapeHtml(BRAND.phone)}.`)}
  `;
  return emailLayout(title, html);
}

export function wholesaleQuotationEmail(data: WholesaleQuotationData, links?: { acceptUrl: string; viewUrl: string; rejectUrl?: string }, opts?: { updateBanner?: string }) {
  const contactMail = `mailto:${BRAND.email}?subject=${encodeURIComponent(`Wholesale quotation ${quoteReference(data)}`)}&body=${encodeURIComponent(`Hi, I have a question about quotation ${quoteReference(data)} (${data.businessName || ''}).`)}`;
  const totals: QuotationTotals = {
    subtotalAmount: data.subtotalAmount,
    discountAmount: data.discountAmount,
    shippingAmount: data.shippingAmount ?? data.shippingCharges,
    payableAmount: data.payableAmount ?? data.totalAmount,
    currency: data.currency,
  };

  const html = `
    ${opts?.updateBanner ? infoBlock('Updated Quotation', `<strong>${escapeHtml('Quotation updated')}</strong><br>${escapeHtml(opts.updateBanner)}`, COLORS.infoBg, '#C5DFF9', COLORS.infoText) : ''}
    ${paragraph(`Dear ${escapeHtml(data.contactPerson || data.businessName || 'Wholesale Partner')},`)}
    ${paragraph(`Thank you for your interest in sourcing spices from <strong>${escapeHtml(BRAND.name)}</strong>. Please find your personalised quotation below — all prices are wholesale pack rates inclusive of GST.`)}
    ${sectionTitle('Customer & Quotation Details')}
    ${quoteCustomerCard(data)}
    ${sectionTitle('Commercial Terms')}
    ${quoteCommercialTerms(data)}
    ${sectionTitle('Quoted Products')}
    ${quotationItemsTable(data.items || [], data.currency || 'INR')}
    ${quotationTotalsBlock(totals)}
    ${data.termsList?.length ? `${smallDivider()}${sectionTitle('Terms & Conditions')}${quoteTermsList(data)}` : ''}
    ${data.notes ? `${smallDivider()}${sectionTitle('Negotiation Notes')}${quoteNotes(data)}` : ''}
    ${links && links.acceptUrl ? buttonRow(buttonPrimary(links.acceptUrl, 'Accept Quotation'), buttonSecondary(contactMail, 'Contact Sales')) : buttonRow(buttonSecondary(contactMail, 'Contact Sales'))}
    ${links && links.rejectUrl ? `<p style="text-align:center;margin:6px 0 0;"><a href="${escapeHtml(links.rejectUrl)}" style="color:${COLORS.muted};font-size:12px;text-decoration:underline;">No longer interested — decline this quotation</a></p>` : ''}
    ${links && links.viewUrl ? mutedNote(`Prefer to review this quotation on our website? <a href="${escapeHtml(links.viewUrl)}" style="color:${'#2A4A3C'};font-weight:600;">View quotation online</a> — this link is valid for the offer period.`) : ''}
    ${mutedNote(`Quotation reference <strong>${escapeHtml(quoteReference(data))}</strong> is valid until <strong>${escapeHtml(formatDate(data.validUntil))}</strong>. Prices and availability may change after this date.`)}
  `;
  return emailLayout(`Wholesale quotation ${quoteReference(data)}`, html);
}

export function wholesaleQuotationAcceptedEmail(data: WholesaleQuotationData, ctx?: { orderReference?: string; paymentInstructions?: string }) {
  const orderRef = ctx?.orderReference || `ORD-${data.id}`;
  const html = `
    ${successNotice('Quotation Accepted', 'Thank you for accepting our quotation! We are excited to begin working with you.')}
    ${paragraph(`Dear ${escapeHtml(data.contactPerson || data.businessName || 'Wholesale Partner')},`)}
    ${paragraph(`We are delighted to confirm that quotation <strong>${escapeHtml(quoteReference(data))}</strong> has been accepted. Your order reference is <strong>${escapeHtml(orderRef)}</strong>.`)}
    ${sectionTitle('Accepted Quotation Summary')}
    ${quoteCustomerCard(data)}
    ${quotationItemsTable(data.items || [], data.currency || 'INR')}
    ${quotationTotalsBlock({
      subtotalAmount: data.subtotalAmount,
      discountAmount: data.discountAmount,
      shippingAmount: data.shippingAmount ?? data.shippingCharges,
      payableAmount: data.payableAmount ?? data.totalAmount,
      currency: data.currency,
    })}
    ${ctx?.paymentInstructions ? `${sectionTitle('Payment Instructions')}${paragraph(ctx.paymentInstructions)}` : ''}
    ${sectionTitle('Next Steps')}
    ${paragraph(`1. Our dispatch team will confirm the production and dispatch schedule.<br>2. Payment terms as agreed (${escapeHtml(data.paymentTerms || 'as per quotation')}).<br>3. Your order will be dispatched with the delivery method selected (${escapeHtml(data.deliveryMethod || 'road freight')}) within ${data.leadTimeDays != null ? escapeHtml(String(data.leadTimeDays)) : 'the agreed'} days.<br>4. We will send a dedicated order confirmation with dispatch updates.`)}
    ${buttonRow(buttonPrimary(`${BRAND.storefrontUrl}`, 'Continue on our website'), buttonSecondary(contactMailButton(data), 'Contact Your Sales Executive'))}
    ${mutedNote(`Questions about your order? Reply to this email, call us at ${escapeHtml(BRAND.phone)}, or reach out to your sales executive ${escapeHtml(data.salesExecutive || '')} on WhatsApp.`)}
  `;
  return emailLayout('Quotation Accepted', html);
}

export function wholesaleQuotationRejectedEmail(data: WholesaleQuotationData) {
  const html = `
    ${heading('Quotation status update')}
    ${paragraph(`Dear ${escapeHtml(data.contactPerson || data.businessName || 'Wholesale Partner')},`)}
    ${paragraph(`We have received your response and noted that quotation <strong>${escapeHtml(quoteReference(data))}</strong> is no longer required. We appreciate you considering <strong>${escapeHtml(BRAND.name)}</strong>.`)}
    ${paragraph(`If your requirements change or you would like to renegotiate pricing, volumes or dispatch terms, our sales team would be glad to revisit the offer. We are always happy to help you source the finest spices.`)}
    ${buttonRow(buttonSecondary(contactMailButton(data), 'Discuss a revised quotation'))}
    ${mutedNote(`We look forward to the possibility of working together in the future.`) }
  `;
  return emailLayout('Quotation status update', html);
}

export function wholesaleOrderConfirmationEmail(data: WholesaleQuotationData, ctx?: { orderReference?: string }) {
  const orderRef = ctx?.orderReference || `ORD-${data.id}`;
  const html = `
    ${successNotice('Wholesale Order Confirmed', `Your order <strong>${escapeHtml(orderRef)}</strong> has been created successfully. Our team has started preparing it.`)}
    ${paragraph(`Dear ${escapeHtml(data.contactPerson || data.businessName || 'Wholesale Partner')},`)}
    ${paragraph(`Thank you for placing a wholesale order with <strong>${escapeHtml(BRAND.name)}</strong>. Here is your order confirmation.`)}
    ${sectionTitle('Order Details')}
    ${keyValueTable([
      { label: 'Order Number', value: `<span style="font-family:monospace;font-weight:700;">${escapeHtml(orderRef)}</span>` },
      { label: 'Quotation Reference', value: escapeHtml(quoteReference(data)) },
      { label: 'Order Date', value: escapeHtml(formatDate(new Date())) },
      { label: 'Company', value: escapeHtml(data.businessName || '—') },
      { label: 'Contact', value: escapeHtml(data.contactPerson || '—') },
      { label: 'Phone', value: escapeHtml(data.phone ? `+91 ${data.phone}` : '—') },
      { label: 'Shipping Address', value: escapeHtml(data.shippingAddress || '—') },
    ])}
    ${sectionTitle('Ordered Products')}
    ${quotationItemsTable(data.items || [], data.currency || 'INR')}
    ${quotationTotalsBlock({
      subtotalAmount: data.subtotalAmount,
      discountAmount: data.discountAmount,
      shippingAmount: data.shippingAmount ?? data.shippingCharges,
      payableAmount: data.payableAmount ?? data.totalAmount,
      currency: data.currency,
    })}
    ${sectionTitle('Commercial & Dispatch Terms')}
    ${quoteCommercialTerms(data)}
    ${sectionTitle('Payment Terms')}
    ${paragraph(data.paymentTerms || 'As per the agreed commercial terms.')}
    ${mutedNote(`Our dispatch team will keep you updated on the processing and dispatch of your order. For any changes, reply to this email or contact your sales executive ${escapeHtml(data.salesExecutive || '')}.`)}
  `;
  return emailLayout(`Wholesale order ${orderRef} confirmed`, html);
}

export function wholesaleOrderStatusEmail(data: WholesaleQuotationData, ctx?: { orderReference?: string; status?: string }) {
  const orderRef = ctx?.orderReference || `ORD-${data.id}`;
  const status = String(ctx?.status || data.status || '').toLowerCase();

  const copyByStatus: Record<string, { title: string; body: string }> = {
    processing: {
      title: 'Order is being processed',
      body: `Your wholesale order <strong>${escapeHtml(orderRef)}</strong> is now being processed. Our team is preparing and quality-checking your spice batch.`,
    },
    packed: {
      title: 'Your order has been packed',
      body: `Your wholesale order <strong>${escapeHtml(orderRef)}</strong> has been packed to our quality standards and is ready for dispatch.`,
    },
    shipped: {
      title: 'Your order has been shipped',
      body: `Your wholesale order <strong>${escapeHtml(orderRef)}</strong> has been dispatched. Our logistics team will share the tracking details shortly.`,
    },
    delivered: {
      title: 'Your order has been delivered',
      body: `Your wholesale order <strong>${escapeHtml(orderRef)}</strong> has been delivered. We hope the batch meets your expectations — we'd love your feedback!`,
    },
    cancelled: {
      title: 'Your order was cancelled',
      body: `Your wholesale order <strong>${escapeHtml(orderRef)}</strong> has been cancelled. If this is unexpected, please contact your sales executive immediately.`,
    },
  };

  const meta = copyByStatus[status] || {
    title: `Order ${status || 'updated'}`,
    body: `Your wholesale order <strong>${escapeHtml(orderRef)}</strong> has been updated to ${escapeHtml(status || 'a new status')}.`,
  };

  const html = `
    ${heading(meta.title)}
    ${paragraph(`Dear ${escapeHtml(data.contactPerson || data.businessName || 'Wholesale Partner')},`)}
    ${paragraph(meta.body)}
    ${smallDivider()}
    ${sectionTitle('Order Summary')}
    ${quotationItemsTable(data.items || [], data.currency || 'INR')}
    ${quotationTotalsBlock({
      subtotalAmount: data.subtotalAmount,
      discountAmount: data.discountAmount,
      shippingAmount: data.shippingAmount ?? data.shippingCharges,
      payableAmount: data.payableAmount ?? data.totalAmount,
      currency: data.currency,
    })}
    ${mutedNote(`For dispatch or delivery updates, reply to this email or contact your sales executive ${escapeHtml(data.salesExecutive || '')}.`)}
  `;
  return emailLayout(meta.title, html);
}

// ---------------------------------------------------------------------------
// Branded status/result page (accept/reject confirmation, invalid links).
// ---------------------------------------------------------------------------

export function brandedMessagePage(title: string, message: string, cta?: { label: string; href: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - ${escapeHtml(BRAND.name)}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 32px rgba(0,0,0,0.08);">
    <div style="background:#2A4A3C;padding:28px 24px;text-align:center;">
      <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:Georgia,serif;">${escapeHtml(BRAND.name)}</h1>
      <p style="color:#ffffff;opacity:0.8;font-size:12px;margin:6px 0 0;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(BRAND.tagline)}</p>
    </div>
    <div style="padding:32px 24px;text-align:center;color:#3d3832;">
      <h2 style="color:#1A1714;font-size:20px;margin:0 0 12px;font-family:Georgia,serif;">${escapeHtml(title)}</h2>
      <p style="color:#3d3832;font-size:14px;line-height:1.7;margin:0 0 20px;">${escapeHtml(message)}</p>
      ${cta ? `<a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#2A4A3C;color:#ffffff;padding:13px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(cta.label)}</a>` : ''}
    </div>
    <div style="background:#FAF8F3;padding:16px 24px;text-align:center;">
      <p style="color:#7A7064;font-size:11px;margin:0;">${escapeHtml(BRAND.phone)} &nbsp;•&nbsp; ${escapeHtml(BRAND.email)}<br>&copy; ${new Date().getFullYear()} ${escapeHtml(BRAND.name)}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function contactMailButton(data: WholesaleQuotationData) {
  const subject = encodeURIComponent(`Enquiry about ${quoteReference(data)} (${data.businessName || ''})`);
  const body = encodeURIComponent(`Hi,\n\nI would like to discuss quotation ${quoteReference(data)}.\n\nThanks,\n${data.contactPerson || ''}`);
  return `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
}

// ---------------------------------------------------------------------------
// Standalone branded web page (used by the public "View quotation" endpoint).
// ---------------------------------------------------------------------------

export function wholesaleQuotationWebPage(data: WholesaleQuotationData, meta: { viewedAt: string }) {
  const acceptAction = meta && data.status !== 'accepted' && data.status !== 'converted' && data.status !== 'expired' ? true : false;
  const body = `
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 32px rgba(0,0,0,0.08);">
      <div style="background:#2A4A3C;padding:28px 24px;text-align:center;">
        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#C9920A;color:#2A4A3C;font-size:24px;font-weight:800;line-height:56px;font-family:Georgia,serif;">LS</div>
        <h1 style="color:#ffffff;font-size:26px;margin:10px 0 2px;font-family:Georgia,serif;">${escapeHtml(BRAND.name)}</h1>
        <p style="color:#ffffff;opacity:0.8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(BRAND.tagline)}</p>
      </div>
      <div style="padding:36px 28px;color:#3d3832;">
        <p style="font-size:18px;font-weight:700;color:#1A1714;margin:0 0 4px;">Wholesale Quotation ${escapeHtml(quoteReference(data))}</p>
        <p style="color:#7A7064;font-size:13px;margin:0 0 20px;">Prepared for ${escapeHtml(data.businessName || data.contactPerson || 'Wholesale Client')} • ${escapeHtml(meta.viewedAt)}</p>
        ${quoteCustomerCard(data)}
        ${sectionTitle('Commercial Terms')}
        ${quoteCommercialTerms(data)}
        ${sectionTitle('Quoted Products')}
        ${quotationItemsTable(data.items || [], data.currency || 'INR')}
        ${quotationTotalsBlock({ subtotalAmount: data.subtotalAmount, discountAmount: data.discountAmount, shippingAmount: data.shippingAmount ?? data.shippingCharges, payableAmount: data.payableAmount ?? data.totalAmount, currency: data.currency })}
        ${data.termsList?.length ? `${smallDivider()}${sectionTitle('Terms & Conditions')}${quoteTermsList(data)}` : ''}
        ${data.notes ? `${smallDivider()}${sectionTitle('Negotiation Notes')}${quoteNotes(data)}` : ''}
      </div>
      <div style="background:#FAF8F3;border-top:1px solid #E7E1D6;padding:24px;text-align:center;">
        <p style="color:#7A7064;font-size:12px;margin:0 0 4px;">${escapeHtml(BRAND.phone)} &nbsp;•&nbsp; ${escapeHtml(BRAND.email)}</p>
        <p style="color:#7A7064;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ${escapeHtml(BRAND.name)}. All rights reserved.</p>
      </div>
    </div>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wholesale Quotation ${escapeHtml(quoteReference(data))} - ${escapeHtml(BRAND.name)}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:760px;margin:0 auto;">
    <div style="overflow-x:auto;">${body}</div>
    ${acceptAction ? `<div style="text-align:center;margin:20px 0 0;"><p style="color:#7A7064;font-size:13px;margin:0 0 10px;">If you would like to proceed with this quotation, respond using the link sent to your email.</p></div>` : ''}
  </div>
</body>
</html>`;
}
