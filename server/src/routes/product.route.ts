import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  getProductController,
  listProductsController,
  createProductController,
  updateProductController,
  deleteProductController
} from '../controllers/product.controller.js';

const router = Router();
const adminGuard = [authenticate, requireRole('staff', 'manager', 'admin')] as const;

router.get('/', asyncHandler(listProductsController));
router.get('/:slug', asyncHandler(getProductController));
router.post('/', ...adminGuard, asyncHandler(createProductController));
router.put('/:id', ...adminGuard, asyncHandler(updateProductController));
router.delete('/:id', ...adminGuard, asyncHandler(deleteProductController));

export default router;
