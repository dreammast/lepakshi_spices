import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listPublishedRecipesController, listAllRecipesController, getRecipeController, createRecipeController, updateRecipeController, deleteRecipeController } from '../controllers/recipe.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const publicRouter = Router();
publicRouter.get('/', asyncHandler(listPublishedRecipesController));
publicRouter.get('/:slug', asyncHandler(getRecipeController));

const adminRouter = Router();
adminRouter.use(authenticate, requireRole('admin', 'manager', 'staff'));
adminRouter.get('/', asyncHandler(listAllRecipesController));
adminRouter.post('/', asyncHandler(createRecipeController));
adminRouter.put('/:id', asyncHandler(updateRecipeController));
adminRouter.delete('/:id', asyncHandler(deleteRecipeController));

export { publicRouter as recipePublicRouter, adminRouter as recipeAdminRouter };
