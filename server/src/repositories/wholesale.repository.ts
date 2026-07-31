import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { wholesaleInquiries, quotations, quotationItems } from '../db/schema.js';

export async function findAllWholesaleInquiries() {
  return db.select().from(wholesaleInquiries).orderBy(desc(wholesaleInquiries.createdAt));
}

export async function findWholesaleInquiryById(id: number) {
  const [inquiry] = await db.select().from(wholesaleInquiries).where(eq(wholesaleInquiries.id, id));
  return inquiry ?? null;
}

export async function createWholesaleInquiryRecord(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  message?: string;
  productInterest?: string;
  volume?: string;
  assignedExecutive?: string;
  notes?: any[];
  timeline?: any[];
  customerId?: number;
}) {
  const now = new Date();
  const [res] = await db.insert(wholesaleInquiries).values({
    companyName: data.companyName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    message: data.message,
    productInterest: data.productInterest,
    volume: data.volume,
    assignedExecutive: data.assignedExecutive,
    notes: data.notes || [],
    timeline: data.timeline || [{ time: now.toISOString(), event: 'Inquiry Created' }],
    customerId: data.customerId,
    status: 'new',
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateWholesaleInquiryRecord(id: number, data: Record<string, any>) {
  const { id: _, createdAt: __, ...rest } = data;
  if (rest.status) {
    const allowed = ['new', 'reviewing', 'quoted', 'contacted', 'quotation_sent', 'negotiation', 'approved', 'processing', 'converted', 'completed', 'rejected', 'cancelled', 'closed'];
    if (!allowed.includes(rest.status)) throw new Error(`Unsupported wholesale status: ${rest.status}`);
  }
  await db.update(wholesaleInquiries).set({ ...rest, updatedAt: new Date() }).where(eq(wholesaleInquiries.id, id));
  const updated = await findWholesaleInquiryById(id);
  if (!updated) throw new Error('Wholesale inquiry not found');
  return updated;
}

export async function updateWholesaleInquiryStatus(id: number, status: string) {
  return updateWholesaleInquiryRecord(id, { status });
}

export async function findAllQuotations() {
  const rows = await db.select().from(quotations).orderBy(desc(quotations.createdAt));
  return Promise.all(rows.map(async q => {
    const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, q.id));
    return { ...q, items };
  }));
}

export async function findQuotationById(id: number) {
  const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
  if (!quotation) return null;
  const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, id));
  return { ...quotation, items };
}

function generateQuoteNumber() {
  return `QT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export async function createQuotationRecord(data: Record<string, any>) {
  const now = new Date();
  const quoteNumber = data.quoteNumber || data.id || generateQuoteNumber();

  const [res] = await db.insert(quotations).values({
    quoteNumber: String(quoteNumber),
    inquiryId: data.inquiryId ? Number(data.inquiryId) : null,
    customerId: data.customerId ? Number(data.customerId) : null,
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    billingAddress: data.billingAddress,
    shippingAddress: data.shippingAddress,
    gstin: data.gstin,
    salesExecutive: data.salesExecutive,
    discountType: data.discountType || 'percentage',
    discountValue: String(data.discountValue ?? '0'),
    shippingCharges: String(data.shippingCharges ?? data.shippingAmount ?? '0'),
    subtotalAmount: String(data.subtotalAmount ?? '0'),
    discountAmount: String(data.discountAmount ?? '0'),
    taxAmount: String(data.taxAmount ?? '0'),
    shippingAmount: String(data.shippingAmount ?? data.shippingCharges ?? '0'),
    totalAmount: String(data.totalAmount ?? '0'),
    payableAmount: String(data.payableAmount ?? data.totalAmount ?? '0'),
    roundOff: String(data.roundOff ?? '0'),
    currency: data.currency || 'INR',
    paymentTerms: data.paymentTerms,
    leadTimeDays: data.leadTimeDays ? Number(data.leadTimeDays) : (data.leadTime ? Number(data.leadTime) : null),
    packagingType: data.packagingType,
    deliveryMethod: data.deliveryMethod,
    notes: data.notes,
    termsList: data.termsList || [],
    timeline: data.timeline || [],
    status: data.status || 'draft',
    createdAt: now,
    updatedAt: now
  });
  const quotationId = res.insertId;

  if (Array.isArray(data.items) && data.items.length > 0) {
    await db.insert(quotationItems).values(
      data.items.map((item: any, idx: number) => ({
        quotationId,
        productName: item.productName || item.name || 'Product',
        weightLabel: item.weightLabel || item.weight || '',
        quantity: String(item.quantity ?? 1),
        unitPrice: String(item.unitPrice ?? 0),
        discountPercent: String(item.discountPercent ?? item.discount ?? 0),
        taxPercent: String(item.taxPercent ?? item.gst ?? 0),
        lineTotal: String(item.lineTotal ?? ((item.quantity || 1) * (item.unitPrice || 0))),
        displayOrder: idx
      }))
    );
  }

  return findQuotationById(quotationId);
}

export async function updateQuotationRecord(id: number, data: Record<string, any>) {
  const { id: _, items, createdAt: __, quoteNumber, ...rest } = data;

  const updateFields: Record<string, any> = { updatedAt: new Date() };

  if (quoteNumber) updateFields.quoteNumber = String(quoteNumber);
  if (rest.inquiryId !== undefined) updateFields.inquiryId = rest.inquiryId ? Number(rest.inquiryId) : null;
  if (rest.customerId !== undefined) updateFields.customerId = rest.customerId ? Number(rest.customerId) : null;
  if (rest.businessName !== undefined) updateFields.businessName = rest.businessName;
  if (rest.contactPerson !== undefined) updateFields.contactPerson = rest.contactPerson;
  if (rest.email !== undefined) updateFields.email = rest.email;
  if (rest.phone !== undefined) updateFields.phone = rest.phone;
  if (rest.billingAddress !== undefined) updateFields.billingAddress = rest.billingAddress;
  if (rest.shippingAddress !== undefined) updateFields.shippingAddress = rest.shippingAddress;
  if (rest.gstin !== undefined) updateFields.gstin = rest.gstin;
  if (rest.salesExecutive !== undefined) updateFields.salesExecutive = rest.salesExecutive;
  if (rest.discountType !== undefined) updateFields.discountType = rest.discountType;
  if (rest.discountValue !== undefined) updateFields.discountValue = String(rest.discountValue);
  if (rest.shippingCharges !== undefined) updateFields.shippingCharges = String(rest.shippingCharges);
  if (rest.subtotalAmount !== undefined) updateFields.subtotalAmount = String(rest.subtotalAmount);
  if (rest.discountAmount !== undefined) updateFields.discountAmount = String(rest.discountAmount);
  if (rest.taxAmount !== undefined) updateFields.taxAmount = String(rest.taxAmount);
  if (rest.shippingAmount !== undefined) updateFields.shippingAmount = String(rest.shippingAmount);
  if (rest.totalAmount !== undefined) updateFields.totalAmount = String(rest.totalAmount);
  if (rest.payableAmount !== undefined) updateFields.payableAmount = String(rest.payableAmount);
  if (rest.roundOff !== undefined) updateFields.roundOff = String(rest.roundOff);
  if (rest.paymentTerms !== undefined) updateFields.paymentTerms = rest.paymentTerms;
  if (rest.leadTimeDays !== undefined || rest.leadTime !== undefined) updateFields.leadTimeDays = Number(rest.leadTimeDays ?? rest.leadTime);
  if (rest.packagingType !== undefined) updateFields.packagingType = rest.packagingType;
  if (rest.deliveryMethod !== undefined) updateFields.deliveryMethod = rest.deliveryMethod;
  if (rest.notes !== undefined) updateFields.notes = rest.notes;
  if (rest.termsList !== undefined) updateFields.termsList = rest.termsList;
  if (rest.timeline !== undefined) updateFields.timeline = rest.timeline;
  if (rest.status !== undefined) updateFields.status = rest.status;

  await db.update(quotations).set(updateFields).where(eq(quotations.id, id));

  if (Array.isArray(items)) {
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    if (items.length > 0) {
      await db.insert(quotationItems).values(
        items.map((item: any, idx: number) => ({
          quotationId: id,
          productName: item.productName || item.name || 'Product',
          weightLabel: item.weightLabel || item.weight || '',
          quantity: String(item.quantity ?? 1),
          unitPrice: String(item.unitPrice ?? 0),
          discountPercent: String(item.discountPercent ?? item.discount ?? 0),
          taxPercent: String(item.taxPercent ?? item.gst ?? 0),
          lineTotal: String(item.lineTotal ?? ((item.quantity || 1) * (item.unitPrice || 0))),
          displayOrder: idx
        }))
      );
    }
  }

  return findQuotationById(id);
}

export async function deleteWholesaleInquiry(id: number) {
  await db.delete(wholesaleInquiries).where(eq(wholesaleInquiries.id, id));
}

export async function deleteQuotation(id: number) {
  await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
  await db.delete(quotations).where(eq(quotations.id, id));
}
