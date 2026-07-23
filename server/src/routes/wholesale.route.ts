import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listWholesaleInquiriesController, createWholesaleInquiryController, updateInquiryStatusController, listQuotationsController, createQuotationController, updateQuotationController } from '../controllers/wholesale.controller.js';

const publicRouter = Router();
publicRouter.post('/', asyncHandler(createWholesaleInquiryController));

const adminRouter = Router();
adminRouter.get('/wholesale-inquiries', asyncHandler(listWholesaleInquiriesController));
adminRouter.put('/wholesale-inquiries/:id/status', asyncHandler(updateInquiryStatusController));
adminRouter.get('/quotations', asyncHandler(listQuotationsController));
adminRouter.post('/quotations', asyncHandler(createQuotationController));
adminRouter.put('/quotations/:id', asyncHandler(updateQuotationController));

export { publicRouter as wholesalePublicRouter, adminRouter as wholesaleAdminRouter };
