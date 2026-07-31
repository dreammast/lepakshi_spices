// ---------------------------------------------------------------------------
// Wholesale Module — Barrel Export
//
// This is the single entry point for the wholesale domain. The route index
// imports the two routers from here.
// ---------------------------------------------------------------------------

export { wholesalePublicRouter } from './routes/public.routes.js';
export { wholesaleAdminRouter } from './routes/admin.routes.js';

// Re-export types for external consumers (e.g. dashboard, types client)
export type {
  WholesaleInquiryStatus,
  QuotationStatus,
  WholesaleOrderStatus,
  InvoiceStatus,
  ActivityEntityType,
  CreateInquiryInput,
  CreateQuotationInput,
  CreateQuotationRevisionInput,
  QuotationLineItem,
  CreateWholesaleOrderInput,
  CreateInvoiceInput,
  ActivityLogInput,
} from './types/index.js';

// Re-export dashboard helper
export { getWholesaleStats } from './dashboard/stats.js';

// Re-export pricing utilities
export {
  calculateLineTotal,
  calculateQuotationTotals,
  formatWholesaleAmount,
} from './services/pricing.service.js';

// Re-export services for inter-module integration or testing
export * as wholesaleInquiryService from './services/inquiry.service.js';
export * as wholesaleQuotationService from './services/quotation.service.js';
export * as wholesaleOrderService from './services/order.service.js';
export * as wholesaleInvoiceService from './services/invoice.service.js';
export * as wholesaleActivityService from './services/activity.service.js';
