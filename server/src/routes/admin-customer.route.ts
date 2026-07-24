import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCustomersController, getCustomerController, updateCustomerRoleController } from '../controllers/admin-customer.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'manager', 'staff'));
router.get('/', asyncHandler(listCustomersController));
router.get('/:id', asyncHandler(getCustomerController));
router.put('/:id/role', asyncHandler(updateCustomerRoleController));

export default router;
