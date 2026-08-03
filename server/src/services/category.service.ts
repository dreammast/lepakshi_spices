import { findAllCategories, findCategoryBySlug, createCategoryRecord, deleteCategoryRecord, updateCategoryRecord } from '../repositories/category.repository.js';
import { AppError } from '../utils/app-error.js';
import { emitAdminAndPublic } from '../realtime/events.js';

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

export async function createCategory(data: { name: string; slug: string; description?: string; imageUrl?: string }) {
  const created = await createCategoryRecord(data);
  emitAdminAndPublic('category.created', { categoryId: created, name: data.name, slug: data.slug, at: new Date() });
  return created;
}

export async function deleteCategory(id: number) {
  const result = await deleteCategoryRecord(id);
  emitAdminAndPublic('category.deleted', { categoryId: id, at: new Date() });
  return result;
}

export async function updateCategory(id: number, data: { name?: string; slug?: string; description?: string; imageUrl?: string }) {
  const updated = await updateCategoryRecord(id, data);
  emitAdminAndPublic('category.updated', { categoryId: id, name: data.name ?? null, at: new Date() });
  return updated;
}


