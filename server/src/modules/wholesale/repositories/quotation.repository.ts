import { eq, desc } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { quotations, quotationItems } from '../../../db/schema.js';
import type { CreateQuotationInput } from '../types/index.js';

// ---------------------------------------------------------------------------
// Quotation Repository
// ---------------------------------------------------------------------------

function generateQuoteNumber() {
  return `QT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
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

export async function findQuotationsByInquiryId(inquiryId: number) {
  const rows = await db.select().from(quotations)
    .where(eq(quotations.inquiryId, inquiryId))
    .orderBy(desc(quotations.createdAt));
  return Promise.all(rows.map(async q => {
    const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, q.id));
    return { ...q, items };
  }));
}

export async function findQuotationRevisions(parentId: number) {
  const rows = await db.select().from(quotations)
    .where(eq(quotations.parentQuotationId, parentId))
    .orderBy(desc(quotations.revisionNumber));
  return Promise.all(rows.map(async q => {
    const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, q.id));
    return { ...q, items };
  }));
}

export async function createQuotationRecord(data: CreateQuotationInput) {
  const now = new Date();
  const [res] = await db.insert(quotations).values({
    quoteNumber: generateQuoteNumber(),
    inquiryId: data.inquiryId,
    customerId: data.customerId,
    subtotalAmount: String(data.totalAmount),
    totalAmount: String(data.totalAmount),
    revisionNumber: 1,
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
        displayOrder: item.displayOrder ?? idx
      }))
    );
  }

  return findQuotationById(quotationId);
}

export async function createQuotationRevision(
  parentId: number,
  inquiryId: number,
  customerId: number | null | undefined,
  currentRevision: number,
  data: {
    totalAmount: string | number;
    items?: Array<{ productName: string; quantity: number; unitPrice: number; lineTotal: number; displayOrder?: number; productVariantId?: number; weightLabel?: string; discountPercent?: number; taxPercent?: number }>;
    notes?: string;
    paymentTerms?: string;
    validUntil?: string;
  },
) {
  const now = new Date();
  const [res] = await db.insert(quotations).values({
    quoteNumber: generateQuoteNumber(),
    inquiryId,
    customerId: customerId ?? undefined,
    parentQuotationId: parentId,
    revisionNumber: currentRevision + 1,
    subtotalAmount: String(data.totalAmount),
    totalAmount: String(data.totalAmount),
    notes: data.notes,
    paymentTerms: data.paymentTerms,
    validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  });
  const quotationId = res.insertId;

  if (data.items?.length) {
    await db.insert(quotationItems).values(
      data.items.map((item, idx) => ({
        quotationId,
        productName: item.productName,
        productVariantId: item.productVariantId,
        weightLabel: item.weightLabel,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        discountPercent: String(item.discountPercent ?? 0),
        taxPercent: String(item.taxPercent ?? 0),
        lineTotal: String(item.lineTotal),
        displayOrder: item.displayOrder ?? idx,
      }))
    );
  }

  return findQuotationById(quotationId);
}

export async function updateQuotationStatus(id: number, status: string) {
  await db.update(quotations).set({ status: status as any, updatedAt: new Date() }).where(eq(quotations.id, id));
  return findQuotationById(id);
}

export async function updateQuotationRecord(id: number, data: Record<string, any>) {
  const { id: _, items: __, createdAt: ___, ...rest } = data;
  await db.update(quotations).set({ ...rest, updatedAt: new Date() }).where(eq(quotations.id, id));
  return findQuotationById(id);
}

export async function deleteQuotation(id: number) {
  await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
  await db.delete(quotations).where(eq(quotations.id, id));
}
