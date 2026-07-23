import type { Request, Response, NextFunction } from 'express';
import { getProductDetails, listProducts, createProduct, updateProduct, deleteProduct } from '../services/product.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listProductsController(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await listProducts();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await getProductDetails(req.params.slug);
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}

export async function createProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const insertedId = await createProduct(req.body);
    sendCreated(res, { id: insertedId, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function updateProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await updateProduct(id, req.body);
    sendSuccess(res, { message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductController(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteProduct(Number(req.params.id));
    sendSuccess(res, { message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}


