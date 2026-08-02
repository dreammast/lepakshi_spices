import { findAllWholesaleInquiries, findWholesaleInquiryById, createWholesaleInquiryRecord, updateWholesaleInquiryRecord, updateWholesaleInquiryStatus, findAllQuotations, findQuotationById, createQuotationRecord, updateQuotationRecord, deleteWholesaleInquiry, deleteQuotation } from '../repositories/wholesale.repository.js';
import { AppError } from '../utils/app-error.js';
import { sendWholesaleEnquiryReceived, sendWholesaleInquiryStatus, sendWholesaleQuotation, sendWholesaleQuotationUpdated, sendWholesaleQuotationAccepted, sendWholesaleQuotationRejected, sendWholesaleOrderConfirmation, sendWholesaleOrderStatus } from '../mail/email.service.js';
import { emailLogEntry } from '../mail/email-log.js';
import { logger } from '../utils/logger.js';
import { listProducts } from './product.service.js';

export function calculateTotals(data: {
  items?: Array<{ quantity?: number; unitPrice?: number; discount?: number; discountPercent?: number; gst?: number; taxPercent?: number; [key: string]: any }>;
  discountType?: 'percentage' | 'flat' | string;
  discountValue?: number | string;
  shippingCharges?: number | string;
  shippingAmount?: number | string;
}) {
  let subtotal = 0;

  const rawItems = data.items || [];
  const processedItems = rawItems.map((item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unitPrice || 0);
    const discPct = Number(item.discountPercent ?? item.discount ?? 0);

    const gross = qty * price;
    const discAmount = gross * (discPct / 100);
    const net = Math.max(0, gross - discAmount);

    subtotal += net;

    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      discountPercent: discPct,
      taxPercent: 0,
      lineTotal: net.toFixed(2)
    };
  });

  const discType = data.discountType || 'percentage';
  const discVal = Number(data.discountValue || 0);
  let overallDiscount = 0;

  if (discType === 'percentage') {
    overallDiscount = subtotal * (discVal / 100);
  } else if (discType === 'flat') {
    overallDiscount = discVal;
  }
  overallDiscount = Math.max(0, Math.min(overallDiscount, subtotal));

  const netSubtotal = Math.max(0, subtotal - overallDiscount);
  const shipCharges = Number(data.shippingCharges ?? data.shippingAmount ?? 0);
  const grand = netSubtotal + shipCharges;
  const rounded = Math.round(grand);
  const roundOff = (rounded - grand).toFixed(2);

  return {
    subtotalAmount: subtotal.toFixed(2),
    discountAmount: overallDiscount.toFixed(2),
    taxAmount: '0.00',
    shippingAmount: shipCharges.toFixed(2),
    totalAmount: grand.toFixed(2),
    payableAmount: rounded.toFixed(2),
    roundOff,
    items: processedItems
  };
}

export async function listWholesaleInquiries() { return findAllWholesaleInquiries(); }
export async function getWholesaleInquiry(id: number) {
  const i = await findWholesaleInquiryById(id);
  if (!i) throw new AppError(404, 'Inquiry not found');
  return i;
}
export async function createWholesaleInquiry(data: Parameters<typeof createWholesaleInquiryRecord>[0]) {
  const id = await createWholesaleInquiryRecord(data);
  const result = await sendWholesaleEnquiryReceived({
    contactName: data.contactName,
    companyName: data.companyName,
    email: data.email,
    productInterest: data.productInterest,
    volume: data.volume,
    reference: `INQ-${id}`,
  });
  const recipient = typeof data.email === 'string' ? data.email : null;
  if (recipient) {
    try {
      const inq = await findWholesaleInquiryById(id);
      const existingTimeline = (inq?.timeline as any[]) || [];
      await updateWholesaleInquiryRecord(id, {
        timeline: [...existingTimeline, emailLogEntry({ type: 'wholesale.enquiry.received', recipient, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: id })],
      });
    } catch (e) {
      logger.warn({ err: e, inquiryId: id }, 'Failed to record enquiry email log');
    }
  }
  return id;
}

export async function updateWholesaleInquiry(id: number, data: Record<string, any>) {
  return updateWholesaleInquiryRecord(id, data);
}

export async function setInquiryStatus(id: number, status: string) {
  const inquiry = await updateWholesaleInquiryStatus(id, status);
  if (status === 'approved' || status === 'rejected') {
    const result = await sendWholesaleInquiryStatus({
      contactName: inquiry.contactName,
      companyName: inquiry.companyName,
      email: inquiry.email,
      status: status as 'approved' | 'rejected',
    });
    try {
      const existingTimeline = (inquiry.timeline as any[]) || [];
      await updateWholesaleInquiryRecord(id, {
        timeline: [...existingTimeline, emailLogEntry({ type: `wholesale.inquiry.${status}`, recipient: inquiry.email, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: id })],
      });
    } catch (e) {
      logger.warn({ err: e, inquiryId: id }, 'Failed to record inquiry status email log');
    }
  }
  return inquiry;
}

export async function listQuotations() { return findAllQuotations(); }
export async function getQuotation(id: number) {
  const q = await findQuotationById(id);
  if (!q) throw new AppError(404, 'Quotation not found');
  return q;
}

export async function createQuotation(data: Record<string, any>) {
  const calculated = calculateTotals(data);
  const mergedData = {
    ...data,
    subtotalAmount: calculated.subtotalAmount,
    discountAmount: calculated.discountAmount,
    taxAmount: calculated.taxAmount,
    shippingAmount: calculated.shippingAmount,
    totalAmount: calculated.totalAmount,
    payableAmount: calculated.payableAmount,
    roundOff: calculated.roundOff,
    items: calculated.items
  };

  const created = await createQuotationRecord(mergedData);
  const timeStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (created?.inquiryId) {
    try {
      const inq = await findWholesaleInquiryById(created.inquiryId);
      if (inq) {
        const existingNotes = (inq.notes as any[]) || [];
        const existingTimeline = (inq.timeline as any[]) || [];
        await updateWholesaleInquiryRecord(created.inquiryId, {
          status: 'quotation_sent',
          notes: [...existingNotes, `[${timeStr}] Quotation ${created.quoteNumber || created.id} generated.`],
          timeline: [...existingTimeline, { time: timeStr, event: `Quotation ${created.quoteNumber || created.id} Sent` }]
        });
      }
    } catch (e) {
      console.warn('Auto-updating inquiry status failed:', e);
    }
  }

  if (String(created?.status || data.status || 'draft') === 'sent') {
    await dispatchQuotationEmail(created, data.attachPdf === true, timeStr);
  }

  return created;
}

export async function updateQuotation(id: number, data: Record<string, any>) {
  const existing = await findQuotationById(id);

  const hasItems = Array.isArray(data.items) && data.items.length > 0;
  let mergedData: Record<string, any>;
  if (hasItems) {
    const calculated = calculateTotals(data);
    mergedData = {
      ...data,
      subtotalAmount: calculated.subtotalAmount,
      discountAmount: calculated.discountAmount,
      taxAmount: calculated.taxAmount,
      shippingAmount: calculated.shippingAmount,
      totalAmount: calculated.totalAmount,
      payableAmount: calculated.payableAmount,
      roundOff: calculated.roundOff,
      items: calculated.items
    };
  } else {
    const rest: Record<string, any> = { ...data };
    delete rest.items;
    mergedData = rest;
  }

  const meaningfulKeys = Object.keys(data).filter((k) => !['id', 'status', 'attachPdf', 'timeline', 'createdAt', 'updatedAt'].includes(k));
  const hasContentChanges = meaningfulKeys.length > 0;

  await updateQuotationRecord(id, mergedData);
  const full = await findQuotationById(id);

  const newStatus = String(mergedData.status ?? existing?.status ?? 'draft');
  const prevStatus = String(existing?.status ?? 'draft');
  const isStatusTransition = newStatus !== prevStatus;

  const timeStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (newStatus === 'sent' && prevStatus !== 'sent') {
    if (full) await dispatchQuotationEmail(full, data.attachPdf === true, timeStr);
  } else if (newStatus === 'accepted' && prevStatus !== 'accepted' && full) {
    const orderRef = `ORD-${full.id}`;
    const result = await sendWholesaleQuotationAccepted(full, {
      orderReference: orderRef,
      paymentInstructions: `Payment is due as per the agreed terms (${full.paymentTerms || '50% advance, 50% on dispatch'}). Please transfer to our official bank account and share the UTR reference with your sales executive.`,
    });
    await appendQuotationTimeline(full, [
      { time: timeStr, event: 'Quotation Accepted by Customer' },
      emailLogEntry({ type: 'wholesale.quotation.accepted', recipient: full.email, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: full.id }),
    ]);
  } else if (newStatus === 'rejected' && prevStatus !== 'rejected' && full) {
    const result = await sendWholesaleQuotationRejected(full);
    await appendQuotationTimeline(full, [
      { time: timeStr, event: 'Quotation Rejected by Customer' },
      emailLogEntry({ type: 'wholesale.quotation.rejected', recipient: full.email, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: full.id }),
    ]);
  } else if (newStatus === 'converted' && prevStatus !== 'converted' && full) {
    const orderRef = `ORD-${full.id}`;
    const result = await sendWholesaleOrderConfirmation(full, { orderReference: orderRef });
    await appendQuotationTimeline(full, [
      { time: timeStr, event: `Wholesale Order ${orderRef} Created & Confirmed` },
      emailLogEntry({ type: 'wholesale.order.confirmed', recipient: full.email, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: full.id }),
    ]);
  } else if (
    !isStatusTransition &&
    full &&
    LIVE_QUOTE_STATUSES.includes(prevStatus) &&
    (hasContentChanges || data.attachPdf === true)
  ) {
    await dispatchQuotationUpdateEmail(full, data.attachPdf === true, timeStr);
  }

  return full;
}

const LIVE_QUOTE_STATUSES = ['sent', 'viewed', 'negotiation'];

async function dispatchQuotationEmail(quotation: any, attachPdf: boolean, timeStr: string) {
  try {
    const result = await sendWholesaleQuotation(quotation, { attachPdf });
    if (result) {
      await appendQuotationTimeline(quotation, [
        emailLogEntry({ type: 'wholesale.quotation.sent', recipient: quotation.email, status: 'sent', messageId: result.messageId, relatedId: quotation.id }),
      ]);
    } else {
      await appendQuotationTimeline(quotation, [
        emailLogEntry({ type: 'wholesale.quotation.sent', recipient: quotation.email, status: 'failed', relatedId: quotation.id }),
      ]);
    }
  } catch (e) {
    logger.error({ err: e, quoteId: quotation.id }, 'Failed to send quotation email');
  }
}

async function dispatchQuotationUpdateEmail(quotation: any, attachPdf: boolean, timeStr: string) {
  try {
    const result = await sendWholesaleQuotationUpdated(quotation, { attachPdf });
    if (result) {
      await appendQuotationTimeline(quotation, [
        emailLogEntry({ type: 'wholesale.quotation.updated', recipient: quotation.email, status: 'sent', messageId: result.messageId, relatedId: quotation.id }),
      ]);
    } else {
      await appendQuotationTimeline(quotation, [
        emailLogEntry({ type: 'wholesale.quotation.updated', recipient: quotation.email, status: 'failed', relatedId: quotation.id }),
      ]);
    }
  } catch (e) {
    logger.error({ err: e, quoteId: quotation.id }, 'Failed to send quotation update email');
  }
}

async function appendQuotationTimeline(quotation: any, events: Array<{ time: string; event: string }>) {
  try {
    const existingTimeline = (quotation.timeline as any[]) || [];
    await updateQuotationRecord(quotation.id, {
      timeline: [...existingTimeline, ...events],
    });
  } catch (e) {
    logger.warn({ err: e, quoteId: quotation.id }, 'Failed to append quotation timeline event');
  }
}

const WHOLESALE_ORDER_STATUSES = ['processing', 'packed', 'shipped', 'delivered', 'cancelled'];

export async function notifyWholesaleOrderStatus(id: number, status: string) {
  const normalized = String(status || '').toLowerCase();
  if (!WHOLESALE_ORDER_STATUSES.includes(normalized)) {
    throw new AppError(400, `Unsupported wholesale order status: ${status}. Supported: ${WHOLESALE_ORDER_STATUSES.join(', ')}`);
  }
  const full = await findQuotationById(id);
  if (!full) throw new AppError(404, 'Quotation not found');
  if (String(full.status) !== 'converted') {
    throw new AppError(409, 'Order status notifications are only available for converted (ordered) quotations');
  }

  const orderRef = `ORD-${full.id}`;
  const result = await sendWholesaleOrderStatus(full, { orderReference: orderRef, status: normalized });
  await appendQuotationTimeline(full, [
    emailLogEntry({ type: `wholesale.order.${normalized}`, recipient: full.email, status: result ? 'sent' : 'failed', messageId: result?.messageId ?? null, relatedId: full.id }),
  ]);
  return findQuotationById(id);
}

export async function respondToQuotation(id: number, action: 'accept' | 'reject') {
  const full = await findQuotationById(id);
  if (!full) throw new AppError(404, 'Quotation not found');
  const current = String(full.status || 'draft');
  if (current === 'accepted' || current === 'rejected' || current === 'converted' || current === 'expired') {
    return full;
  }
  if (action !== 'accept' && action !== 'reject') {
    throw new AppError(400, 'Action must be accept or reject');
  }
  return updateQuotation(id, { status: action });
}

export async function recordQuotationView(id: number) {
  const full = await findQuotationById(id);
  if (!full) throw new AppError(404, 'Quotation not found');
  const events = (full.timeline as any[]) || [];
  const alreadyViewed = events.some((e) => String(e.event || '').toLowerCase().includes('viewed'));
  if (!alreadyViewed) {
    await appendQuotationTimeline(full, [
      { time: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: 'Quotation Viewed (online)' },
    ]);
  }
  return findQuotationById(id);
}

export async function removeWholesaleInquiry(id: number) { return deleteWholesaleInquiry(id); }
export async function removeQuotation(id: number) { return deleteQuotation(id); }
export async function listWholesaleCatalogueData() {
  return listProducts();
}
