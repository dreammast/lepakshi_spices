import type { Request, Response, NextFunction } from 'express';
import { getProductDetails, listProducts, createProduct, updateProduct, deleteProduct, updateVariantStock, checkStock, validateComboAvailability } from '../services/product.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listProductsController(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await listProducts();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function listAdminProductsController(_req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await listProducts(true));
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

export async function updateVariantStockController(req: Request, res: Response, next: NextFunction) {
  try {
    const variantId = Number(req.params.variantId);
    const { stock, lowStockThreshold } = req.body;
    const updated = await updateVariantStock(variantId, Number(stock), lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined);
    sendSuccess(res, updated, 'Variant stock updated');
  } catch (error) {
    next(error);
  }
}

export async function checkStockController(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantIds } = req.body;
    if (!Array.isArray(variantIds) || variantIds.length === 0) {
      sendSuccess(res, []);
      return;
    }
    const stockInfo = await checkStock(variantIds.map(Number));
    sendSuccess(res, stockInfo);
  } catch (error) {
    next(error);
  }
}

export async function validateComboController(req: Request, res: Response, next: NextFunction) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length || items.some((item: any) => !Number.isInteger(Number(item.productVariantId)) || Number(item.quantity) <= 0)) {
      sendSuccess(res, { available: false, unavailableItems: [] });
      return;
    }
    sendSuccess(res, await validateComboAvailability(items.map((item: any) => ({ productVariantId: Number(item.productVariantId), quantity: Number(item.quantity) }))));
  } catch (error) {
    next(error);
  }
}


