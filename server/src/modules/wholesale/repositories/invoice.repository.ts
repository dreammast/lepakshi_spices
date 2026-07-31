import { eq, desc } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { wholesaleInvoices } from '../../../db/schema.js';

// ---------------------------------------------------------------------------
// Wholesale Invoice Repository
// ---------------------------------------------------------------------------

export async function findInvoicesByCustomer(customerId: number) {
  return db.select().from(wholesaleInvoices)
    .where(eq(wholesaleInvoices.customerId, customerId))
    .orderBy(desc(wholesaleInvoices.createdAt));
}

function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export interface CreateInvoiceData {
  wholesaleOrderId: number;
  customerId?: number | null;
  subtotalAmount: string;
  taxAmount: string;
  additionalCharges?: string | null;
  totalAmount: string;
  currency: string;
  dueDate?: Date | null;
  notes?: string | null;
}

export async function createInvoiceRecord(data: CreateInvoiceData) {
  const now = new Date();
  const [res] = await db.insert(wholesaleInvoices).values({
    invoiceNumber: generateInvoiceNumber(),
    wholesaleOrderId: data.wholesaleOrderId,
    customerId: data.customerId ?? undefined,
    subtotalAmount: data.subtotalAmount,
    taxAmount: data.taxAmount,
    additionalCharges: data.additionalCharges || '0',
    totalAmount: data.totalAmount,
    currency: data.currency,
    status: 'draft',
    dueDate: data.dueDate ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: now,
    updatedAt: now,
  });
  return findInvoiceById(res.insertId);
}

export async function findInvoiceById(id: number) {
  const [invoice] = await db.select().from(wholesaleInvoices).where(eq(wholesaleInvoices.id, id));
  return invoice ?? null;
}

export async function findAllInvoices() {
  return db.select().from(wholesaleInvoices).orderBy(desc(wholesaleInvoices.createdAt));
}

export async function findInvoicesByOrderId(orderId: number) {
  return db.select().from(wholesaleInvoices)
    .where(eq(wholesaleInvoices.wholesaleOrderId, orderId))
    .orderBy(desc(wholesaleInvoices.createdAt));
}

export async function updateInvoiceStatusRecord(id: number, status: string, paidAt?: Date | null) {
  const updateData: Record<string, any> = {
    status: status as any,
    updatedAt: new Date()
  };
  if (paidAt !== undefined) {
    updateData.paidAt = paidAt;
  }
  await db.update(wholesaleInvoices)
    .set(updateData)
    .where(eq(wholesaleInvoices.id, id));
  return findInvoiceById(id);
}
