import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listAuditLogsController } from '../controllers/audit.controller.js';

const router = Router();
router.use(authenticate, requireRole('staff', 'manager', 'admin'));
router.get('/', asyncHandler(listAuditLogsController));

export default router;
