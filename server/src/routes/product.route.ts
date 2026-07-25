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

router.get('/', asyncHandler(listProductsController));
router.get('/:slug', asyncHandler(getProductController));
// The current admin UI has no login flow, so catalog management remains open.
router.post('/', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(createProductController));
router.put('/:id', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(updateProductController));
router.delete('/:id', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(deleteProductController));

export default router;
