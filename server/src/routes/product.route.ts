import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
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
router.post('/', asyncHandler(createProductController));
router.put('/:id', asyncHandler(updateProductController));
router.delete('/:id', asyncHandler(deleteProductController));

export default router;
