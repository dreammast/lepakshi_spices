import { findAllWholesaleInquiries, findWholesaleInquiryById, createWholesaleInquiryRecord, updateWholesaleInquiryStatus, findAllQuotations, findQuotationById, createQuotationRecord, updateQuotationRecord, deleteWholesaleInquiry, deleteQuotation } from '../repositories/wholesale.repository.js';
import { AppError } from '../utils/app-error.js';
import { sendEmailSafely, wholesaleInquiryEmailTemplate } from '../mail/send-email.js';

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
export async function createQuotation(data: Parameters<typeof createQuotationRecord>[0]) { return createQuotationRecord(data); }
export async function updateQuotation(id: number, data: Record<string, any>) { return updateQuotationRecord(id, data); }
export async function removeWholesaleInquiry(id: number) { return deleteWholesaleInquiry(id); }
export async function removeQuotation(id: number) { return deleteQuotation(id); }
