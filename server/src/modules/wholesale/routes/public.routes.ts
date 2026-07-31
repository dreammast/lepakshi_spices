import { Router } from 'express';
import { asyncHandler } from '../../../middleware/async-handler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  createWholesaleInquiryController,
  listCustomerInquiriesController,
} from '../controllers/inquiry.controller.js';
import {
  listWholesaleCatalogueController,
  listCustomerQuotationsController,
  getQuotationPdfController,
} from '../controllers/quotation.controller.js';
import {
  listCustomerOrdersController,
} from '../controllers/order.controller.js';
import {
  listCustomerInvoicesController,
} from '../controllers/invoice.controller.js';
import {
  getEntityActivityController,
} from '../controllers/activity.controller.js';

// ---------------------------------------------------------------------------
// Public/Customer wholesale routes
// ---------------------------------------------------------------------------

const publicRouter = Router();

// Unauthenticated public routes
publicRouter.post('/', asyncHandler(createWholesaleInquiryController));
publicRouter.get('/catalogue', asyncHandler(listWholesaleCatalogueController));

// Authenticated customer-facing B2B routes
publicRouter.get('/my/inquiries', authenticate, asyncHandler(listCustomerInquiriesController));
publicRouter.get('/my/quotations', authenticate, asyncHandler(listCustomerQuotationsController));
publicRouter.get('/my/quotations/:id/pdf', authenticate, asyncHandler(getQuotationPdfController));
publicRouter.get('/my/orders', authenticate, asyncHandler(listCustomerOrdersController));
publicRouter.get('/my/invoices', authenticate, asyncHandler(listCustomerInvoicesController));

// Shipment tracking / activity history for an order
publicRouter.get('/my/orders/:id/tracking', authenticate, (req: any, res, next) => {
  req.params.entityType = 'order';
  next();
}, asyncHandler(getEntityActivityController));

export { publicRouter as wholesalePublicRouter };
