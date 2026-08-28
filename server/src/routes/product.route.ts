import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  getProductController,
  listProductsController,
  listAdminProductsController,
  createProductController,
  updateProductController,
  deleteProductController,
  updateVariantStockController,
  checkStockController
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', asyncHandler(listProductsController));
router.get('/admin/all', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(listAdminProductsController));
router.post('/stock-check', asyncHandler(checkStockController));
router.get('/:slug', asyncHandler(getProductController));
router.post('/', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(createProductController));
router.put('/variants/:variantId/stock', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(updateVariantStockController));
router.put('/:id', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(updateProductController));
router.delete('/:id', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(deleteProductController));

export default router;
