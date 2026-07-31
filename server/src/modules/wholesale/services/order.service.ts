import {
  createWholesaleOrderRecord,
  findWholesaleOrderById,
  findAllWholesaleOrders,
  updateWholesaleOrderStatusRecord,
  findWholesaleOrdersByCustomer,
} from '../repositories/order.repository.js';
import { findQuotationById, updateQuotationStatus } from '../repositories/quotation.repository.js';
import { findWholesaleInquiryById, updateWholesaleInquiryStatus } from '../repositories/inquiry.repository.js';
import { AppError } from '../../../utils/app-error.js';
import { recordActivity } from './activity.service.js';
import { sendEmailSafely } from '../../../mail/send-email.js';
import { wholesaleOrderConfirmationTemplate, wholesaleOrderStatusTemplate } from '../emails/templates.js';
import type { WholesaleOrderStatus } from '../types/index.js';
import { WHOLESALE_ORDER_STATUSES } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Order Service
// ---------------------------------------------------------------------------

export async function listCustomerOrders(customerId: number, email: string) {
  return findWholesaleOrdersByCustomer(customerId, email);
}

/**
 * Convert an accepted quotation into a wholesale order.
 * Copies all quotation fields + items, marks quotation as 'converted',
 * marks inquiry as 'converted', logs activity on all three entities.
 */
export async function convertQuotationToOrder(quotationId: number) {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) throw new AppError(404, 'Quotation not found');
  if (quotation.status !== 'accepted') {
    throw new AppError(400, `Cannot convert quotation with status "${quotation.status}". Only accepted quotations can be converted to orders.`);
  }

  // Fetch the inquiry for snapshot data
  const inquiry = await findWholesaleInquiryById(quotation.inquiryId);
  if (!inquiry) throw new AppError(404, 'Related inquiry not found');

  // Create wholesale order with all data inherited from quotation + inquiry
  const order = await createWholesaleOrderRecord({
    quotationId: quotation.id,
    inquiryId: quotation.inquiryId,
    customerId: quotation.customerId,
    companyName: inquiry.companyName,
    contactName: inquiry.contactName,
    email: inquiry.email,
    phone: inquiry.phone,
    billingAddress: quotation.billingAddress,
    shippingAddress: quotation.shippingAddress,
    gstin: quotation.gstin,
    subtotalAmount: quotation.subtotalAmount,
    discountAmount: quotation.discountAmount,
    taxAmount: quotation.taxAmount,
    shippingAmount: quotation.shippingAmount,
    additionalCharges: quotation.additionalCharges,
    deliveryTerms: quotation.deliveryTerms,
    totalAmount: quotation.totalAmount,
    currency: quotation.currency,
    paymentTerms: quotation.paymentTerms,
    items: quotation.items.map(item => ({
      productVariantId: item.productVariantId,
      productName: item.productName,
      weightLabel: item.weightLabel,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      taxPercent: item.taxPercent,
      lineTotal: item.lineTotal,
      displayOrder: item.displayOrder,
    })),
  });

  // Mark quotation as converted
  await updateQuotationStatus(quotationId, 'converted');

  // Mark inquiry as converted
  await updateWholesaleInquiryStatus(inquiry.id, 'converted');

  // Log activity on all three entities
  await recordActivity({
    entityType: 'order',
    entityId: order!.id,
    action: 'created',
    newValue: JSON.stringify({ orderNumber: order!.orderNumber, fromQuotation: quotation.quoteNumber }),
  });
  await recordActivity({
    entityType: 'quotation',
    entityId: quotationId,
    action: 'status_changed',
    previousValue: 'accepted',
    newValue: 'converted',
    notes: `Converted to wholesale order ${order!.orderNumber}`,
  });
  await recordActivity({
    entityType: 'inquiry',
    entityId: inquiry.id,
    action: 'status_changed',
    previousValue: inquiry.status,
    newValue: 'converted',
    notes: `Converted to wholesale order ${order!.orderNumber}`,
  });

  // Send confirmation email
  if (inquiry.email) {
    await sendEmailSafely({
      to: inquiry.email,
      subject: `Wholesale Order Confirmed: ${order!.orderNumber}`,
      html: wholesaleOrderConfirmationTemplate(
        inquiry.contactName,
        inquiry.companyName,
        order!.orderNumber,
        Number(order!.totalAmount),
      ),
    });
  }

  return order;
}

export async function listWholesaleOrders() {
  return findAllWholesaleOrders();
}

export async function getWholesaleOrder(id: number) {
  const order = await findWholesaleOrderById(id);
  if (!order) throw new AppError(404, 'Wholesale order not found');
  return order;
}

export async function updateWholesaleOrderStatus(id: number, status: string) {
  if (!WHOLESALE_ORDER_STATUSES.includes(status as WholesaleOrderStatus)) {
    throw new AppError(400, `Invalid wholesale order status: ${status}`);
  }

  const order = await findWholesaleOrderById(id);
  if (!order) throw new AppError(404, 'Wholesale order not found');
  if (order.status === status) return order;

  const previousStatus = order.status;
  const updated = await updateWholesaleOrderStatusRecord(id, status);

  await recordActivity({
    entityType: 'order',
    entityId: id,
    action: 'status_changed',
    previousValue: previousStatus,
    newValue: status,
  });

  // Send status emails for key transitions
  if (order.email && ['shipped', 'delivered', 'cancelled'].includes(status)) {
    await sendEmailSafely({
      to: order.email,
      subject: `Wholesale Order ${status}: ${order.orderNumber}`,
      html: wholesaleOrderStatusTemplate(
        order.contactName || 'Customer',
        order.companyName || '',
        order.orderNumber,
        status,
      ),
    });
  }

  return updated;
}
