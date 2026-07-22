import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { getCategoryController, listCategoriesController, createCategoryController, deleteCategoryController } from '../controllers/category.controller.js';

const router = Router();

router.get('/', asyncHandler(listCategoriesController));
router.post('/', asyncHandler(createCategoryController));
router.delete('/:id', asyncHandler(deleteCategoryController));
router.get('/:slug', asyncHandler(getCategoryController));

export default router;


