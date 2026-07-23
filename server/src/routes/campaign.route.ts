import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listCampaignsController, activeCampaignsController, createCampaignController, updateCampaignController, deleteCampaignController } from '../controllers/campaign.controller.js';

const publicRouter = Router();
publicRouter.get('/active', asyncHandler(activeCampaignsController));

const adminRouter = Router();
adminRouter.use(authenticate, requireRole('staff', 'manager', 'admin'));
adminRouter.get('/', asyncHandler(listCampaignsController));
adminRouter.post('/', asyncHandler(createCampaignController));
adminRouter.put('/:id', asyncHandler(updateCampaignController));
adminRouter.delete('/:id', asyncHandler(deleteCampaignController));

export { publicRouter as campaignPublicRouter, adminRouter as campaignAdminRouter };
