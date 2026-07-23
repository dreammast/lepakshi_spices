import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
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
router.post('/', asyncHandler(createCategoryController));
router.put('/:id', asyncHandler(updateCategoryController));
router.delete('/:id', asyncHandler(deleteCategoryController));

export default router;
