import { eq, desc, or } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { wholesaleOrders, wholesaleOrderItems } from '../../../db/schema.js';

// ---------------------------------------------------------------------------
// Wholesale Order Repository
// ---------------------------------------------------------------------------

export async function findWholesaleOrdersByCustomer(customerId: number, email: string) {
  const rows = await db.select().from(wholesaleOrders)
    .where(or(
      eq(wholesaleOrders.customerId, customerId),
      eq(wholesaleOrders.email, email)
    ))
    .orderBy(desc(wholesaleOrders.createdAt));
  return Promise.all(rows.map(async o => {
    const items = await db.select().from(wholesaleOrderItems).where(eq(wholesaleOrderItems.wholesaleOrderId, o.id));
    return { ...o, items };
  }));
}

function generateWholesaleOrderNumber() {
  return `WO-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export interface CreateWholesaleOrderData {
  quotationId: number;
  inquiryId: number;
  customerId?: number | null;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  gstin?: string | null;
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  shippingAmount: string;
  additionalCharges?: string | null;
  deliveryTerms?: string | null;
  totalAmount: string;
  currency: string;
  paymentTerms?: string | null;
  notes?: string | null;
  items: Array<{
    productVariantId?: number | null;
    productName: string;
    weightLabel?: string | null;
    quantity: string;
    unitPrice: string;
    discountPercent: string;
    taxPercent: string;
    lineTotal: string;
    displayOrder: number;
  }>;
}

export async function createWholesaleOrderRecord(data: CreateWholesaleOrderData) {
  const now = new Date();
  const [res] = await db.insert(wholesaleOrders).values({
    orderNumber: generateWholesaleOrderNumber(),
    quotationId: data.quotationId,
    inquiryId: data.inquiryId,
    customerId: data.customerId ?? undefined,
    companyName: data.companyName ?? undefined,
    contactName: data.contactName ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    billingAddress: data.billingAddress ?? undefined,
    shippingAddress: data.shippingAddress ?? undefined,
    gstin: data.gstin ?? undefined,
    subtotalAmount: data.subtotalAmount,
    discountAmount: data.discountAmount,
    taxAmount: data.taxAmount,
    shippingAmount: data.shippingAmount,
    additionalCharges: data.additionalCharges || '0',
    deliveryTerms: data.deliveryTerms ?? undefined,
    totalAmount: data.totalAmount,
    currency: data.currency,
    paymentTerms: data.paymentTerms ?? undefined,
    notes: data.notes ?? undefined,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  const orderId = res.insertId;

  if (data.items.length > 0) {
    await db.insert(wholesaleOrderItems).values(
      data.items.map(item => ({
        wholesaleOrderId: orderId,
        productVariantId: item.productVariantId ?? undefined,
        productName: item.productName,
        weightLabel: item.weightLabel ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent,
        lineTotal: item.lineTotal,
        displayOrder: item.displayOrder,
      }))
    );
  }

  return findWholesaleOrderById(orderId);
}

export async function findWholesaleOrderById(id: number) {
  const [order] = await db.select().from(wholesaleOrders).where(eq(wholesaleOrders.id, id));
  if (!order) return null;
  const items = await db.select().from(wholesaleOrderItems).where(eq(wholesaleOrderItems.wholesaleOrderId, id));
  return { ...order, items };
}

export async function findAllWholesaleOrders() {
  const rows = await db.select().from(wholesaleOrders).orderBy(desc(wholesaleOrders.createdAt));
  return Promise.all(rows.map(async o => {
    const items = await db.select().from(wholesaleOrderItems).where(eq(wholesaleOrderItems.wholesaleOrderId, o.id));
    return { ...o, items };
  }));
}

export async function findWholesaleOrdersByInquiryId(inquiryId: number) {
  const rows = await db.select().from(wholesaleOrders)
    .where(eq(wholesaleOrders.inquiryId, inquiryId))
    .orderBy(desc(wholesaleOrders.createdAt));
  return Promise.all(rows.map(async o => {
    const items = await db.select().from(wholesaleOrderItems).where(eq(wholesaleOrderItems.wholesaleOrderId, o.id));
    return { ...o, items };
  }));
}

export async function updateWholesaleOrderStatusRecord(id: number, status: string) {
  await db.update(wholesaleOrders)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(wholesaleOrders.id, id));
  return findWholesaleOrderById(id);
}
