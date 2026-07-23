import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listCustomersController, getCustomerController, updateCustomerRoleController } from '../controllers/admin-customer.controller.js';

const router = Router();
router.use(authenticate, requireRole('staff', 'manager', 'admin'));
router.get('/', asyncHandler(listCustomersController));
router.get('/:id', asyncHandler(getCustomerController));
router.put('/:id/role', asyncHandler(updateCustomerRoleController));

export default router;
