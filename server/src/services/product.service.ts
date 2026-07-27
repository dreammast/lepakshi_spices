import {
  findAllActiveProducts,
  findProductBySlug,
  findProductImagesByProductId,
  findProductVariantsByProductId,
  createProductRecord,
  updateProductRecord,
  deleteProductRecord,
  updateVariantStockRecord,
  checkVariantsStock
} from '../repositories/product.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listProducts() {
  return findAllActiveProducts();
}

export async function getProductDetails(slug: string) {
  const product = await findProductBySlug(slug);

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  return product;
}

export async function createProduct(data: any) {
  return createProductRecord(data);
}

export async function updateProduct(id: number, data: any) {
  return updateProductRecord(id, data);
}

export async function deleteProduct(id: number) {
  return deleteProductRecord(id);
}

export async function updateVariantStock(variantId: number, stock: number, lowStockThreshold?: number) {
  const updated = await updateVariantStockRecord(variantId, stock, lowStockThreshold);
  if (!updated) throw new AppError(404, 'Product variant not found');
  return updated;
}

export async function checkStock(variantIds: number[]) {
  return checkVariantsStock(variantIds);
}


