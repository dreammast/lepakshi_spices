import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listCustomersController, getCustomerController, updateCustomerRoleController, updateCustomerProfileController } from '../controllers/admin-customer.controller.js';

const router = Router();
router.get('/', asyncHandler(listCustomersController));
router.get('/:id', asyncHandler(getCustomerController));
router.put('/:id/role', asyncHandler(updateCustomerRoleController));
router.put('/:id/profile', asyncHandler(updateCustomerProfileController));

export default router;

