import { Router } from 'express';
import { asyncHandler } from '../../../middleware/async-handler.js';
import { validateBody } from '../../../middleware/validate.middleware.js';
import {
  listWholesaleInquiriesController,
  getWholesaleInquiryController,
  updateInquiryStatusController,
  deleteWholesaleInquiryController,
} from '../controllers/inquiry.controller.js';
import {
  listQuotationsController,
  getQuotationController,
  createQuotationController,
  updateQuotationController,
  deleteQuotationController,
  createQuotationRevisionController,
  acceptQuotationController,
} from '../controllers/quotation.controller.js';
import {
  convertQuotationToOrderController,
  listWholesaleOrdersController,
  getWholesaleOrderController,
  updateWholesaleOrderStatusController,
} from '../controllers/order.controller.js';
import {
  generateInvoiceController,
  listInvoicesController,
  getInvoiceController,
  updateInvoiceStatusController,
} from '../controllers/invoice.controller.js';
import {
  getEntityActivityController,
  getRecentActivityController,
} from '../controllers/activity.controller.js';
import {
  updateInquiryStatusSchema,
  createQuotationSchema,
  updateQuotationSchema,
  createQuotationRevisionSchema,
  acceptQuotationSchema,
  convertQuotationToOrderSchema,
  updateWholesaleOrderStatusSchema,
  createInvoiceSchema,
  updateInvoiceStatusSchema,
} from '../validation/index.js';

// ---------------------------------------------------------------------------
// Admin wholesale routes (mounted behind auth + role middleware in route index)
// ---------------------------------------------------------------------------

const adminRouter = Router();

// Inquiry management
adminRouter.get('/wholesale-inquiries', asyncHandler(listWholesaleInquiriesController));
adminRouter.get('/wholesale-inquiries/:id', asyncHandler(getWholesaleInquiryController));
adminRouter.put('/wholesale-inquiries/:id/status', validateBody(updateInquiryStatusSchema), asyncHandler(updateInquiryStatusController));
adminRouter.delete('/wholesale-inquiries/:id', asyncHandler(deleteWholesaleInquiryController));

// Quotation management
adminRouter.get('/quotations', asyncHandler(listQuotationsController));
adminRouter.get('/quotations/:id', asyncHandler(getQuotationController));
adminRouter.post('/quotations', validateBody(createQuotationSchema), asyncHandler(createQuotationController));
adminRouter.post('/quotations/:id/revisions', validateBody(createQuotationRevisionSchema), asyncHandler(createQuotationRevisionController));
adminRouter.put('/quotations/:id/accept', validateBody(acceptQuotationSchema), asyncHandler(acceptQuotationController));
adminRouter.put('/quotations/:id', validateBody(updateQuotationSchema), asyncHandler(updateQuotationController));
adminRouter.delete('/quotations/:id', asyncHandler(deleteQuotationController));

// Order management
adminRouter.get('/wholesale-orders', asyncHandler(listWholesaleOrdersController));
adminRouter.get('/wholesale-orders/:id', asyncHandler(getWholesaleOrderController));
adminRouter.post('/wholesale-orders/from-quotation', validateBody(convertQuotationToOrderSchema), asyncHandler(convertQuotationToOrderController));
adminRouter.put('/wholesale-orders/:id/status', validateBody(updateWholesaleOrderStatusSchema), asyncHandler(updateWholesaleOrderStatusController));

// Invoice management
adminRouter.get('/wholesale-invoices', asyncHandler(listInvoicesController));
adminRouter.get('/wholesale-invoices/:id', asyncHandler(getInvoiceController));
adminRouter.post('/wholesale-invoices', validateBody(createInvoiceSchema), asyncHandler(generateInvoiceController));
adminRouter.put('/wholesale-invoices/:id/status', validateBody(updateInvoiceStatusSchema), asyncHandler(updateInvoiceStatusController));

// Activity Log management
adminRouter.get('/wholesale-activity', asyncHandler(getRecentActivityController));
adminRouter.get('/wholesale-activity/:entityType/:id', asyncHandler(getEntityActivityController));

export { adminRouter as wholesaleAdminRouter };
