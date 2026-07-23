import { findAllWholesaleInquiries, findWholesaleInquiryById, createWholesaleInquiryRecord, updateWholesaleInquiryStatus, findAllQuotations, findQuotationById, createQuotationRecord, updateQuotationRecord } from '../repositories/wholesale.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listWholesaleInquiries() { return findAllWholesaleInquiries(); }
export async function getWholesaleInquiry(id: number) {
  const i = await findWholesaleInquiryById(id);
  if (!i) throw new AppError(404, 'Inquiry not found');
  return i;
}
export async function createWholesaleInquiry(data: Parameters<typeof createWholesaleInquiryRecord>[0]) { return createWholesaleInquiryRecord(data); }
export async function setInquiryStatus(id: number, status: string) { return updateWholesaleInquiryStatus(id, status); }

export async function listQuotations() { return findAllQuotations(); }
export async function getQuotation(id: number) {
  const q = await findQuotationById(id);
  if (!q) throw new AppError(404, 'Quotation not found');
  return q;
}
export async function createQuotation(data: Parameters<typeof createQuotationRecord>[0]) { return createQuotationRecord(data); }
export async function updateQuotation(id: number, data: Record<string, any>) { return updateQuotationRecord(id, data); }
