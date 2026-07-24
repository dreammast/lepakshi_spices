import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listAuditLogsController } from '../controllers/audit.controller.js';

const router = Router();
router.get('/', asyncHandler(listAuditLogsController));

export default router;
