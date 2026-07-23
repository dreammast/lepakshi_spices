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
  customerId?: number;
}) {
  const now = new Date();
  const [res] = await db.insert(wholesaleInquiries).values({
    companyName: data.companyName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    message: data.message,
    customerId: data.customerId,
    status: 'new',
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateWholesaleInquiryStatus(id: number, status: string) {
  await db.update(wholesaleInquiries).set({ status: status as any, updatedAt: new Date() }).where(eq(wholesaleInquiries.id, id));
  return findWholesaleInquiryById(id);
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

export async function createQuotationRecord(data: {
  inquiryId: number;
  customerId?: number;
  totalAmount: string | number;
  items?: Array<{ productName: string; quantity: number; unitPrice: number; lineTotal: number }>;
}) {
  const now = new Date();
  const [res] = await db.insert(quotations).values({
    quoteNumber: generateQuoteNumber(),
    inquiryId: data.inquiryId,
    customerId: data.customerId,
    subtotalAmount: String(data.totalAmount),
    totalAmount: String(data.totalAmount),
    status: 'draft',
    createdAt: now,
    updatedAt: now
  });
  const quotationId = res.insertId;

  if (data.items?.length) {
    await db.insert(quotationItems).values(
      data.items.map((item, idx) => ({
        quotationId,
        productName: item.productName,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        lineTotal: String(item.lineTotal),
        displayOrder: idx
      }))
    );
  }

  return findQuotationById(quotationId);
}

export async function updateQuotationRecord(id: number, data: Record<string, any>) {
  const { id: _, items: __, createdAt: ___, ...rest } = data;
  await db.update(quotations).set({ ...rest, updatedAt: new Date() }).where(eq(quotations.id, id));
  return findQuotationById(id);
}
