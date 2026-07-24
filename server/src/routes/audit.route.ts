import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listAuditLogsController } from '../controllers/audit.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'manager', 'staff'));
router.get('/', asyncHandler(listAuditLogsController));

export default router;
