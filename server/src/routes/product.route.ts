import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import {
  getProductController,
  listProductsController,
  createProductController,
  updateProductController,
  deleteProductController
} from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', asyncHandler(listProductsController));
router.get('/:slug', asyncHandler(getProductController));
router.post('/', authenticate, requireRole('admin', 'manager', 'staff'), asyncHandler(createProductController));
router.put('/:id', authenticate, requireRole('admin', 'manager', 'staff'), asyncHandler(updateProductController));
router.delete('/:id', authenticate, requireRole('admin', 'manager', 'staff'), asyncHandler(deleteProductController));

export default router;
