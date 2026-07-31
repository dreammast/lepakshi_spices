import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listAuditLogsController, createAuditLogController } from '../controllers/audit.controller.js';

const router = Router();
router.get('/', asyncHandler(listAuditLogsController));
router.post('/', asyncHandler(createAuditLogController));

export default router;
