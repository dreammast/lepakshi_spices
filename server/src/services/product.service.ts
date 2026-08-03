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
import { emitAdminAndPublic, notifyAdmin } from '../realtime/events.js';

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
  const productId = await createProductRecord(data);
  emitAdminAndPublic('product.created', { productId, name: data.name ?? null, slug: data.slug ?? null, at: new Date() });
  notifyAdmin('product.created', 'New Product Added', data.name ?? `Product #${productId}`, { productId });
  return productId;
}

export async function updateProduct(id: number, data: any) {
  const updated = await updateProductRecord(id, data);
  const prevStock = data.stock;
  emitAdminAndPublic('product.updated', { productId: id, name: data.name ?? null, at: new Date() });
  if (prevStock !== undefined) {
    emitAdminAndPublic('product.stock_changed', { productId: id, stock: prevStock, at: new Date() });
  }
  return updated;
}

export async function deleteProduct(id: number) {
  const result = await deleteProductRecord(id);
  emitAdminAndPublic('product.deleted', { productId: id, at: new Date() });
  return result;
}

export async function updateVariantStock(variantId: number, stock: number, lowStockThreshold?: number) {
  const updated = await updateVariantStockRecord(variantId, stock, lowStockThreshold);
  if (!updated) throw new AppError(404, 'Product variant not found');
  emitAdminAndPublic('product.stock_changed', {
    variantId,
    productId: updated.productId ?? null,
    stock,
    lowStockThreshold: updated.lowStockThreshold ?? lowStockThreshold,
    at: new Date(),
  });
  notifyAdmin('product.stock_changed', 'Stock Updated', `Variant #${variantId} now has ${stock} in stock`, { variantId, productId: updated.productId });
  return updated;
}

export async function checkStock(variantIds: number[]) {
  return checkVariantsStock(variantIds);
}


