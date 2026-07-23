import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listWholesaleInquiriesController, createWholesaleInquiryController, updateInquiryStatusController, listQuotationsController, createQuotationController, updateQuotationController } from '../controllers/wholesale.controller.js';

const publicRouter = Router();
publicRouter.post('/', asyncHandler(createWholesaleInquiryController));

const adminRouter = Router();
adminRouter.use(authenticate, requireRole('staff', 'manager', 'admin'));
adminRouter.get('/wholesale-inquiries', asyncHandler(listWholesaleInquiriesController));
adminRouter.put('/wholesale-inquiries/:id/status', asyncHandler(updateInquiryStatusController));
adminRouter.get('/quotations', asyncHandler(listQuotationsController));
adminRouter.post('/quotations', asyncHandler(createQuotationController));
adminRouter.put('/quotations/:id', asyncHandler(updateQuotationController));

export { publicRouter as wholesalePublicRouter, adminRouter as wholesaleAdminRouter };
