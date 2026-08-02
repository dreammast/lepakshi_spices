import { findAllWholesaleInquiries, findWholesaleInquiryById, createWholesaleInquiryRecord, updateWholesaleInquiryRecord, updateWholesaleInquiryStatus, findAllQuotations, findQuotationById, createQuotationRecord, updateQuotationRecord, deleteWholesaleInquiry, deleteQuotation } from '../repositories/wholesale.repository.js';
import { AppError } from '../utils/app-error.js';
import { sendEmailSafely, wholesaleInquiryEmailTemplate } from '../mail/send-email.js';
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
  await sendEmailSafely({
    to: data.email,
    subject: 'Wholesale request received',
    html: wholesaleInquiryEmailTemplate(data.contactName, data.companyName, 'received'),
  });
  return id;
}

export async function updateWholesaleInquiry(id: number, data: Record<string, any>) {
  return updateWholesaleInquiryRecord(id, data);
}

export async function setInquiryStatus(id: number, status: string) {
  const inquiry = await updateWholesaleInquiryStatus(id, status);
  if (status === 'approved' || status === 'rejected') {
    await sendEmailSafely({
      to: inquiry.email,
      subject: `Wholesale request ${status}`,
      html: wholesaleInquiryEmailTemplate(inquiry.contactName, inquiry.companyName, status as 'approved' | 'rejected'),
    });
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

  if (created?.inquiryId) {
    try {
      const inq = await findWholesaleInquiryById(created.inquiryId);
      if (inq) {
        const timeStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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

  return created;
}

export async function updateQuotation(id: number, data: Record<string, any>) {
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

  return updateQuotationRecord(id, mergedData);
}

export async function removeWholesaleInquiry(id: number) { return deleteWholesaleInquiry(id); }
export async function removeQuotation(id: number) { return deleteQuotation(id); }
export async function listWholesaleCatalogueData() {
  return listProducts();
}
