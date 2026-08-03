import { findAllRecipes, findPublishedRecipes, findRecipeBySlug, findRecipeById, createRecipeRecord, updateRecipeRecord, deleteRecipeRecord } from '../repositories/recipe.repository.js';
import { AppError } from '../utils/app-error.js';
import { emitAdminAndPublic } from '../realtime/events.js';

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|avi|mkv|ogg)(\?.*)?$/i;

function enrichRecipe(r: Record<string, any>) {
  const url = r.imageUrl || '';
  const youtubeMatch = url.match(YOUTUBE_REGEX);
  let thumbnailUrl: string | null = null;
  let youtubeVideoId: string | null = null;

  if (youtubeMatch) {
    youtubeVideoId = youtubeMatch[1];
    thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  } else if (url && !VIDEO_EXT_REGEX.test(url)) {
    thumbnailUrl = url;
  } else if (url) {
    thumbnailUrl = url;
  }

  return { ...r, thumbnailUrl, youtubeVideoId };
}

export async function listPublishedRecipes() {
  const recipes = await findPublishedRecipes();
  return recipes.map(enrichRecipe);
}

export async function listAllRecipes() {
  const recipes = await findAllRecipes();
  return recipes.map(enrichRecipe);
}

export async function getRecipeBySlug(slug: string) {
  const r = await findRecipeBySlug(slug);
  if (!r) throw new AppError(404, 'Recipe not found');
  return enrichRecipe(r);
}

export async function createRecipe(data: Parameters<typeof createRecipeRecord>[0]) {
  const created = await createRecipeRecord(data);
  emitAdminAndPublic('recipe.created', { recipeId: created, title: data.title ?? null, slug: data.slug ?? null, at: new Date() });
  return created;
}
export async function updateRecipe(id: number, data: Record<string, any>) {
  const updated = await updateRecipeRecord(id, data);
  emitAdminAndPublic('recipe.updated', { recipeId: id, title: data.title ?? null, at: new Date() });
  return updated;
}
export async function deleteRecipe(id: number) {
  const result = await deleteRecipeRecord(id);
  emitAdminAndPublic('recipe.deleted', { recipeId: id, at: new Date() });
  return result;
}
