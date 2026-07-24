import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { listPublishedRecipesController, listAllRecipesController, getRecipeController, createRecipeController, updateRecipeController, deleteRecipeController } from '../controllers/recipe.controller.js';

const publicRouter = Router();
publicRouter.get('/', asyncHandler(listPublishedRecipesController));
publicRouter.get('/:slug', asyncHandler(getRecipeController));

const adminRouter = Router();
adminRouter.get('/', asyncHandler(listAllRecipesController));
adminRouter.post('/', asyncHandler(createRecipeController));
adminRouter.put('/:id', asyncHandler(updateRecipeController));
adminRouter.delete('/:id', asyncHandler(deleteRecipeController));

export { publicRouter as recipePublicRouter, adminRouter as recipeAdminRouter };
