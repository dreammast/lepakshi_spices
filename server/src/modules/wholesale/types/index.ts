// ---------------------------------------------------------------------------
// Wholesale domain types
// ---------------------------------------------------------------------------

/** All valid statuses for a wholesale inquiry. */
export const WHOLESALE_INQUIRY_STATUSES = [
  'new', 'reviewing', 'quoted', 'contacted', 'quotation_sent',
  'negotiation', 'approved', 'processing', 'converted',
  'completed', 'rejected', 'cancelled', 'closed',
] as const;

export type WholesaleInquiryStatus = (typeof WHOLESALE_INQUIRY_STATUSES)[number];

/** All valid statuses for a quotation. */
export const QUOTATION_STATUSES = [
  'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted',
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

/** All valid statuses for a wholesale order. */
export const WHOLESALE_ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled',
] as const;

export type WholesaleOrderStatus = (typeof WHOLESALE_ORDER_STATUSES)[number];

/** All valid statuses for an invoice. */
export const INVOICE_STATUSES = [
  'draft', 'sent', 'paid', 'overdue', 'cancelled',
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Activity log entity types. */
export const ACTIVITY_ENTITY_TYPES = [
  'inquiry', 'quotation', 'order', 'invoice',
] as const;

export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

// ---------------------------------------------------------------------------
// Input shapes
// ---------------------------------------------------------------------------

/** Input shape for creating a wholesale inquiry. */
export interface CreateInquiryInput {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  message?: string;
  customerId?: number;
}

/** A single line item within a quotation. */
export interface QuotationLineItem {
  productName: string;
  weightLabel?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  lineTotal: number;
  displayOrder?: number;
  productVariantId?: number;
}

/** Input shape for creating a quotation. */
export interface CreateQuotationInput {
  inquiryId: number;
  customerId?: number;
  totalAmount: string | number;
  items?: QuotationLineItem[];
}

/** Input shape for creating a quotation revision. */
export interface CreateQuotationRevisionInput {
  parentQuotationId: number;
  totalAmount: string | number;
  items?: QuotationLineItem[];
  notes?: string;
  paymentTerms?: string;
  validUntil?: string;
}

/** Input shape for updating a quotation. */
export interface UpdateQuotationInput {
  [key: string]: unknown;
}

/** Input shape for converting a quotation into a wholesale order. */
export interface CreateWholesaleOrderInput {
  quotationId: number;
}

/** Input shape for generating an invoice from an order. */
export interface CreateInvoiceInput {
  wholesaleOrderId: number;
  dueDate?: string;
  notes?: string;
}

/** Input shape for recording an activity. */
export interface ActivityLogInput {
  entityType: ActivityEntityType;
  entityId: number;
  action: string;
  previousValue?: string | null;
  newValue?: string | null;
  performedBy?: number | null;
  notes?: string | null;
}
