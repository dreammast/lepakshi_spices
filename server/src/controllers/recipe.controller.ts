import type { Request, Response, NextFunction } from 'express';
import { listPublishedRecipes, listAllRecipes, getRecipeBySlug, createRecipe, updateRecipe, deleteRecipe } from '../services/recipe.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listPublishedRecipesController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listPublishedRecipes()); } catch (e) { next(e); }
}

export async function listAllRecipesController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listAllRecipes()); } catch (e) { next(e); }
}

export async function getRecipeController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getRecipeBySlug(req.params.slug)); } catch (e) { next(e); }
}

export async function createRecipeController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createRecipe(req.body); sendCreated(res, { id, ...req.body }); } catch (e) { next(e); }
}

export async function updateRecipeController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateRecipe(Number(req.params.id), req.body), 'Recipe updated'); } catch (e) { next(e); }
}

export async function deleteRecipeController(req: Request, res: Response, next: NextFunction) {
  try { await deleteRecipe(Number(req.params.id)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
}
