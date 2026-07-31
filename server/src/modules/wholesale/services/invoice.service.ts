import {
  createInvoiceRecord,
  findInvoiceById,
  findAllInvoices,
  updateInvoiceStatusRecord,
  findInvoicesByCustomer,
} from '../repositories/invoice.repository.js';
import { findWholesaleOrderById } from '../repositories/order.repository.js';
import { AppError } from '../../../utils/app-error.js';
import { recordActivity } from './activity.service.js';
import { sendEmailSafely } from '../../../mail/send-email.js';
import { invoiceSentEmailTemplate, invoicePaidEmailTemplate } from '../emails/templates.js';
import type { InvoiceStatus } from '../types/index.js';
import { INVOICE_STATUSES } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Invoice Service
// ---------------------------------------------------------------------------

export async function listCustomerInvoices(customerId: number) {
  return findInvoicesByCustomer(customerId);
}

export async function generateInvoiceFromOrder(orderId: number, dueDateStr?: string, notes?: string) {
  const order = await findWholesaleOrderById(orderId);
  if (!order) throw new AppError(404, 'Wholesale order not found');

  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

  const invoice = await createInvoiceRecord({
    wholesaleOrderId: order.id,
    customerId: order.customerId,
    subtotalAmount: order.subtotalAmount,
    taxAmount: order.taxAmount,
    additionalCharges: order.additionalCharges,
    totalAmount: order.totalAmount,
    currency: order.currency,
    dueDate,
    notes,
  });

  await recordActivity({
    entityType: 'invoice',
    entityId: invoice!.id,
    action: 'created',
    newValue: JSON.stringify({ invoiceNumber: invoice!.invoiceNumber, wholesaleOrderId: orderId }),
  });

  await recordActivity({
    entityType: 'order',
    entityId: orderId,
    action: 'invoice_generated',
    newValue: invoice!.invoiceNumber,
  });

  return invoice;
}

export async function listInvoices() {
  return findAllInvoices();
}

export async function getInvoice(id: number) {
  const invoice = await findInvoiceById(id);
  if (!invoice) throw new AppError(404, 'Invoice not found');
  return invoice;
}

export async function updateInvoiceStatus(id: number, status: string) {
  if (!INVOICE_STATUSES.includes(status as InvoiceStatus)) {
    throw new AppError(400, `Invalid invoice status: ${status}`);
  }

  const invoice = await findInvoiceById(id);
  if (!invoice) throw new AppError(404, 'Invoice not found');
  if (invoice.status === status) return invoice;

  const order = await findWholesaleOrderById(invoice.wholesaleOrderId);
  const previousStatus = invoice.status;

  const paidAt = status === 'paid' ? new Date() : null;
  const updated = await updateInvoiceStatusRecord(id, status, paidAt);

  await recordActivity({
    entityType: 'invoice',
    entityId: id,
    action: 'status_changed',
    previousValue: previousStatus,
    newValue: status,
  });

  // Handle emails
  if (order && order.email) {
    if (status === 'sent') {
      await sendEmailSafely({
        to: order.email,
        subject: `Wholesale Invoice Sent: ${invoice.invoiceNumber}`,
        html: invoiceSentEmailTemplate(
          order.contactName || 'Customer',
          order.companyName || '',
          invoice.invoiceNumber,
          Number(invoice.totalAmount),
          invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : '',
        ),
      });
    } else if (status === 'paid') {
      await sendEmailSafely({
        to: order.email,
        subject: `Wholesale Payment Received: ${invoice.invoiceNumber}`,
        html: invoicePaidEmailTemplate(
          order.contactName || 'Customer',
          order.companyName || '',
          invoice.invoiceNumber,
        ),
      });
    }
  }

  return updated;
}

export async function markInvoicePaid(id: number) {
  return updateInvoiceStatus(id, 'paid');
}
