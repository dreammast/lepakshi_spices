import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { getSettingController, upsertSettingController } from '../controllers/settings.controller.js';

const publicRouter = Router();
publicRouter.get('/:key', asyncHandler(getSettingController));

const adminRouter = Router();
adminRouter.put('/:key', asyncHandler(upsertSettingController));

export { publicRouter as settingsPublicRouter, adminRouter as settingsAdminRouter };
