import { z } from 'zod';

// ---------------------------------------------------------------------------
// Wholesale validation schemas (Zod)
// ---------------------------------------------------------------------------

export const createInquirySchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  contactName: z.string().min(1, 'Contact name is required').max(255),
  email: z.string().email('Valid email is required').max(255),
  phone: z.string().max(32).optional(),
  message: z.string().optional(),
  customerId: z.number().int().positive().optional(),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum([
    'new', 'reviewing', 'quoted', 'contacted', 'quotation_sent',
    'negotiation', 'approved', 'processing', 'converted',
    'completed', 'rejected', 'cancelled', 'closed',
  ]),
});

const quotationLineItemSchema = z.object({
  productName: z.string().min(1),
  weightLabel: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discountPercent: z.number().min(0).max(100).optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  lineTotal: z.number().min(0),
  displayOrder: z.number().int().optional(),
  productVariantId: z.number().int().positive().optional(),
});

export const createQuotationSchema = z.object({
  inquiryId: z.number().int().positive(),
  customerId: z.number().int().positive().optional(),
  totalAmount: z.union([z.string(), z.number()]),
  items: z.array(quotationLineItemSchema).optional(),
});

export const updateQuotationSchema = z.object({}).passthrough();

export const createQuotationRevisionSchema = z.object({
  totalAmount: z.union([z.string(), z.number()]),
  items: z.array(quotationLineItemSchema).optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  validUntil: z.string().optional(),
});

export const acceptQuotationSchema = z.object({
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Wholesale Order validation
// ---------------------------------------------------------------------------

export const convertQuotationToOrderSchema = z.object({
  quotationId: z.number().int().positive(),
});

export const updateWholesaleOrderStatusSchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'processing', 'shipped',
    'delivered', 'completed', 'cancelled',
  ]),
});

// ---------------------------------------------------------------------------
// Invoice validation
// ---------------------------------------------------------------------------

export const createInvoiceSchema = z.object({
  wholesaleOrderId: z.number().int().positive(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
});
