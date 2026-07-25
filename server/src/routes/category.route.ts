import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  getCategoryController,
  listCategoriesController,
  createCategoryController,
  deleteCategoryController,
  updateCategoryController
} from '../controllers/category.controller.js';

const router = Router();

router.get('/', asyncHandler(listCategoriesController));
router.get('/:slug', asyncHandler(getCategoryController));
router.post('/', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(createCategoryController));
router.put('/:id', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(updateCategoryController));
router.delete('/:id', authenticate, requireRole('admin', 'staff', 'manager'), asyncHandler(deleteCategoryController));

export default router;
