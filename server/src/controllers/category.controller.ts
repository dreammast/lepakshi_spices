import type { Request, Response, NextFunction } from 'express';
import { getCategoryBySlug, listCategories, createCategory, deleteCategory } from '../services/category.service.js';
import { sendSuccess } from '../utils/response.util.js';

export async function listCategoriesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await listCategories();
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await getCategoryBySlug(req.params.slug);
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function createCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug, description } = req.body;
    const insertedId = await createCategory({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description
    });
    sendSuccess(res, { id: insertedId, name, slug }, 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteCategory(Number(req.params.id));
    sendSuccess(res, { message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}


