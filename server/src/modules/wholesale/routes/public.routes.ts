import { Router } from 'express';
import { asyncHandler } from '../../../middleware/async-handler.js';
import {
  createWholesaleInquiryController,
} from '../controllers/inquiry.controller.js';
import {
  listWholesaleCatalogueController,
} from '../controllers/quotation.controller.js';

// ---------------------------------------------------------------------------
// Public wholesale routes (no authentication required)
// ---------------------------------------------------------------------------

const publicRouter = Router();

publicRouter.post('/', asyncHandler(createWholesaleInquiryController));
publicRouter.get('/catalogue', asyncHandler(listWholesaleCatalogueController));

export { publicRouter as wholesalePublicRouter };
