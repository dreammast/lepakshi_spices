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
const adminGuard = [authenticate, requireRole('staff', 'manager', 'admin')] as const;

router.get('/', asyncHandler(listCategoriesController));
router.get('/:slug', asyncHandler(getCategoryController));
router.post('/', ...adminGuard, asyncHandler(createCategoryController));
router.put('/:id', ...adminGuard, asyncHandler(updateCategoryController));
router.delete('/:id', ...adminGuard, asyncHandler(deleteCategoryController));

export default router;
