import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listWholesaleInquiriesController, createWholesaleInquiryController, updateInquiryStatusController, deleteWholesaleInquiryController, listQuotationsController, createQuotationController, updateQuotationController, deleteQuotationController, listWholesaleCatalogueController } from '../controllers/wholesale.controller.js';

const publicRouter = Router();
publicRouter.post('/', asyncHandler(createWholesaleInquiryController));
publicRouter.get('/catalogue', asyncHandler(listWholesaleCatalogueController));

const adminRouter = Router();
// The current admin frontend does not yet establish an admin JWT session.
// Keep the management routes reachable by that UI until its login flow is added.
adminRouter.get('/wholesale-inquiries', asyncHandler(listWholesaleInquiriesController));
adminRouter.put('/wholesale-inquiries/:id/status', asyncHandler(updateInquiryStatusController));
adminRouter.delete('/wholesale-inquiries/:id', asyncHandler(deleteWholesaleInquiryController));
adminRouter.get('/quotations', asyncHandler(listQuotationsController));
adminRouter.post('/quotations', asyncHandler(createQuotationController));
adminRouter.put('/quotations/:id', asyncHandler(updateQuotationController));
adminRouter.delete('/quotations/:id', asyncHandler(deleteQuotationController));

export { publicRouter as wholesalePublicRouter, adminRouter as wholesaleAdminRouter };
