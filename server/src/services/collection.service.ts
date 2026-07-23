import { findAllCollections, findCollectionBySlug, createCollectionRecord, updateCollectionRecord, deleteCollectionRecord, replaceCollectionProducts } from '../repositories/collection.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listCollections() { return findAllCollections(); }

export async function getCollectionBySlug(slug: string) {
  const c = await findCollectionBySlug(slug);
  if (!c) throw new AppError(404, 'Collection not found');
  return c;
}

export async function createCollection(data: Parameters<typeof createCollectionRecord>[0]) { return createCollectionRecord(data); }
export async function updateCollection(id: number, data: Parameters<typeof updateCollectionRecord>[1]) { return updateCollectionRecord(id, data); }
export async function deleteCollection(id: number) { return deleteCollectionRecord(id); }
export async function setCollectionProducts(id: number, productIds: number[]) { return replaceCollectionProducts(id, productIds); }
