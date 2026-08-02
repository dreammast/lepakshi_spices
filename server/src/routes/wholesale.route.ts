import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listWholesaleInquiriesController, createWholesaleInquiryController, updateWholesaleInquiryController, updateInquiryStatusController, deleteWholesaleInquiryController, listQuotationsController, createQuotationController, updateQuotationController, deleteQuotationController, listWholesaleCatalogueController, viewQuotationController, respondQuotationController, notifyOrderStatusController, getQuotationController } from '../controllers/wholesale.controller.js';

const publicRouter = Router();
publicRouter.post('/', asyncHandler(createWholesaleInquiryController));
publicRouter.get('/catalogue', asyncHandler(listWholesaleCatalogueController));

// Public quotation endpoints reachable from signed links inside emails.
const quotePublicRouter = Router();
quotePublicRouter.get('/:id/view', viewQuotationController);
quotePublicRouter.get('/:id/respond', respondQuotationController);
quotePublicRouter.post('/:id/respond', respondQuotationController);

const adminRouter = Router();
// The current admin frontend does not yet establish an admin JWT session.
// Keep the management routes reachable by that UI until its login flow is added.
adminRouter.get('/wholesale-inquiries', asyncHandler(listWholesaleInquiriesController));
adminRouter.put('/wholesale-inquiries/:id', asyncHandler(updateWholesaleInquiryController));
adminRouter.put('/wholesale-inquiries/:id/status', asyncHandler(updateInquiryStatusController));
adminRouter.delete('/wholesale-inquiries/:id', asyncHandler(deleteWholesaleInquiryController));
adminRouter.get('/quotations', asyncHandler(listQuotationsController));
adminRouter.get('/quotations/:id', asyncHandler(getQuotationController));
adminRouter.post('/quotations', asyncHandler(createQuotationController));
adminRouter.put('/quotations/:id', asyncHandler(updateQuotationController));
adminRouter.delete('/quotations/:id', asyncHandler(deleteQuotationController));
adminRouter.post('/quotations/:id/notify-order-status', asyncHandler(notifyOrderStatusController));

export { publicRouter as wholesalePublicRouter, quotePublicRouter as wholesaleQuotePublicRouter, adminRouter as wholesaleAdminRouter };
