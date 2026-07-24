import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCustomersController, getCustomerController, updateCustomerRoleController } from '../controllers/admin-customer.controller.js';

const router = Router();
router.get('/', asyncHandler(listCustomersController));
router.get('/:id', asyncHandler(getCustomerController));
router.put('/:id/role', asyncHandler(updateCustomerRoleController));

export default router;
