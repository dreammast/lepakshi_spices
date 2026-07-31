import {
  findAllWholesaleInquiries,
  findWholesaleInquiryById,
  createWholesaleInquiryRecord,
  updateWholesaleInquiryStatus,
  deleteWholesaleInquiry,
  findWholesaleInquiriesByCustomer,
} from '../repositories/inquiry.repository.js';
import { findQuotationsByInquiryId } from '../repositories/quotation.repository.js';
import { findWholesaleOrdersByInquiryId } from '../repositories/order.repository.js';
import { recordActivity, getEntityHistory } from './activity.service.js';
import { AppError } from '../../../utils/app-error.js';
import { sendEmailSafely } from '../../../mail/send-email.js';
import { wholesaleInquiryEmailTemplate } from '../emails/templates.js';
import type { CreateInquiryInput } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Inquiry Service
// ---------------------------------------------------------------------------

export async function listCustomerInquiries(customerId: number, email: string) {
  return findWholesaleInquiriesByCustomer(customerId, email);
}

export async function listWholesaleInquiries() {
  return findAllWholesaleInquiries();
}

export async function getWholesaleInquiry(id: number) {
  const inquiry = await findWholesaleInquiryById(id);
  if (!inquiry) throw new AppError(404, 'Inquiry not found');
  return inquiry;
}

export async function getInquiryWithDetails(id: number) {
  const inquiry = await getWholesaleInquiry(id);
  const quotations = await findQuotationsByInquiryId(id);
  const orders = await findWholesaleOrdersByInquiryId(id);
  const history = await getEntityHistory('inquiry', id);

  return {
    ...inquiry,
    quotations,
    orders,
    activityHistory: history,
  };
}

export async function createWholesaleInquiry(data: CreateInquiryInput) {
  const id = await createWholesaleInquiryRecord(data);
  
  await recordActivity({
    entityType: 'inquiry',
    entityId: id,
    action: 'created',
    newValue: JSON.stringify({ companyName: data.companyName, contactName: data.contactName }),
  });

  await sendEmailSafely({
    to: data.email,
    subject: 'Wholesale request received',
    html: wholesaleInquiryEmailTemplate(data.contactName, data.companyName, 'received'),
  });
  return id;
}

export async function setInquiryStatus(id: number, status: string) {
  const inquiry = await getWholesaleInquiry(id);
  const previousStatus = inquiry.status;
  const updated = await updateWholesaleInquiryStatus(id, status);

  await recordActivity({
    entityType: 'inquiry',
    entityId: id,
    action: 'status_changed',
    previousValue: previousStatus,
    newValue: status,
  });

  if (status === 'approved' || status === 'rejected') {
    await sendEmailSafely({
      to: updated.email,
      subject: `Wholesale request ${status}`,
      html: wholesaleInquiryEmailTemplate(
        updated.contactName,
        updated.companyName,
        status as 'approved' | 'rejected',
      ),
    });
  }
  return updated;
}

export async function removeWholesaleInquiry(id: number) {
  return deleteWholesaleInquiry(id);
}

