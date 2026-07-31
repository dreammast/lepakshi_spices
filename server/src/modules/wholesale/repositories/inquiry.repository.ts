import { eq, desc, or } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { wholesaleInquiries } from '../../../db/schema.js';
import type { CreateInquiryInput, WholesaleInquiryStatus } from '../types/index.js';
import { WHOLESALE_INQUIRY_STATUSES } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Inquiry Repository
// ---------------------------------------------------------------------------

export async function findWholesaleInquiriesByCustomer(customerId: number, email: string) {
  return db.select().from(wholesaleInquiries)
    .where(or(
      eq(wholesaleInquiries.customerId, customerId),
      eq(wholesaleInquiries.email, email)
    ))
    .orderBy(desc(wholesaleInquiries.createdAt));
}

export async function findAllWholesaleInquiries() {
  return db.select().from(wholesaleInquiries).orderBy(desc(wholesaleInquiries.createdAt));
}

export async function findWholesaleInquiryById(id: number) {
  const [inquiry] = await db.select().from(wholesaleInquiries).where(eq(wholesaleInquiries.id, id));
  return inquiry ?? null;
}

export async function createWholesaleInquiryRecord(data: CreateInquiryInput) {
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
  if (!WHOLESALE_INQUIRY_STATUSES.includes(status as WholesaleInquiryStatus)) {
    throw new Error(`Unsupported wholesale status: ${status}`);
  }
  await db.update(wholesaleInquiries)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(wholesaleInquiries.id, id));
  const updated = await findWholesaleInquiryById(id);
  if (!updated) throw new Error('Wholesale inquiry not found');
  return updated;
}

export async function deleteWholesaleInquiry(id: number) {
  await db.delete(wholesaleInquiries).where(eq(wholesaleInquiries.id, id));
}
