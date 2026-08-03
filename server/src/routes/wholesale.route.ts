import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { listWholesaleInquiriesController, createWholesaleInquiryController, updateWholesaleInquiryController, updateInquiryStatusController, deleteWholesaleInquiryController, listQuotationsController, createQuotationController, updateQuotationController, downloadQuotationPdfController, deleteQuotationController, listWholesaleCatalogueController, viewQuotationController, respondQuotationController, notifyOrderStatusController, getQuotationController, emailQuotationCatalogueController, listMyQuotationsController } from '../controllers/wholesale.controller.js';

const publicRouter = Router();
publicRouter.post('/', asyncHandler(createWholesaleInquiryController));
publicRouter.get('/catalogue', asyncHandler(listWholesaleCatalogueController));

// Public quotation endpoints reachable from signed links inside emails.
const quotePublicRouter = Router();
quotePublicRouter.get('/:id/view', viewQuotationController);
quotePublicRouter.get('/:id/respond', respondQuotationController);
quotePublicRouter.post('/:id/respond', respondQuotationController);

// Authenticated customer endpoint: list the logged-in customer's own quotations.
const quoteCustomerRouter = Router();
quoteCustomerRouter.get('/mine', authenticate, asyncHandler(listMyQuotationsController));

const adminRouter = Router();
// The current admin frontend does not yet establish an admin JWT session.
// Keep the management routes reachable by that UI until its login flow is added.
adminRouter.get('/wholesale-inquiries', asyncHandler(listWholesaleInquiriesController));
adminRouter.put('/wholesale-inquiries/:id', asyncHandler(updateWholesaleInquiryController));
adminRouter.put('/wholesale-inquiries/:id/status', asyncHandler(updateInquiryStatusController));
adminRouter.delete('/wholesale-inquiries/:id', asyncHandler(deleteWholesaleInquiryController));
adminRouter.get('/quotations', asyncHandler(listQuotationsController));
adminRouter.get('/quotations/:id/pdf', asyncHandler(downloadQuotationPdfController));
adminRouter.get('/quotations/:id', asyncHandler(getQuotationController));
adminRouter.post('/quotations', asyncHandler(createQuotationController));
adminRouter.put('/quotations/:id', asyncHandler(updateQuotationController));
adminRouter.delete('/quotations/:id', asyncHandler(deleteQuotationController));
adminRouter.post('/quotations/:id/notify-order-status', asyncHandler(notifyOrderStatusController));
adminRouter.post('/quotations/:id/email-catalogue', asyncHandler(emailQuotationCatalogueController));

export { publicRouter as wholesalePublicRouter, quotePublicRouter as wholesaleQuotePublicRouter, quoteCustomerRouter as wholesaleQuoteCustomerRouter, adminRouter as wholesaleAdminRouter };
