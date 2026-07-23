import { findPackagingByProduct, findPackagingById, createPackagingRecord, updatePackagingRecord, deletePackagingRecord } from '../repositories/packaging.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listProductPackaging(productId: number) { return findPackagingByProduct(productId); }

export async function getPackaging(id: number) {
  const p = await findPackagingById(id);
  if (!p) throw new AppError(404, 'Packaging not found');
  return p;
}

export async function createPackaging(productId: number, data: Parameters<typeof createPackagingRecord>[1]) { return createPackagingRecord(productId, data); }
export async function updatePackaging(id: number, data: Record<string, any>) { return updatePackagingRecord(id, data); }
export async function deletePackaging(id: number) { return deletePackagingRecord(id); }
