import { findAllRecipes, findPublishedRecipes, findRecipeBySlug, findRecipeById, createRecipeRecord, updateRecipeRecord, deleteRecipeRecord } from '../repositories/recipe.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listPublishedRecipes() { return findPublishedRecipes(); }
export async function listAllRecipes() { return findAllRecipes(); }

export async function getRecipeBySlug(slug: string) {
  const r = await findRecipeBySlug(slug);
  if (!r) throw new AppError(404, 'Recipe not found');
  return r;
}

export async function createRecipe(data: Parameters<typeof createRecipeRecord>[0]) { return createRecipeRecord(data); }
export async function updateRecipe(id: number, data: Record<string, any>) { return updateRecipeRecord(id, data); }
export async function deleteRecipe(id: number) { return deleteRecipeRecord(id); }
