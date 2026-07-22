import { findAllCategories, findCategoryBySlug, createCategoryRecord, deleteCategoryRecord } from '../repositories/category.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listCategories() {
  return findAllCategories();
}

export async function getCategoryBySlug(slug: string) {
  const category = await findCategoryBySlug(slug);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }
  return category;
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  return createCategoryRecord(data);
}

export async function deleteCategory(id: number) {
  return deleteCategoryRecord(id);
}


