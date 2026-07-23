import type { Request, Response, NextFunction } from 'express';
import { listCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection, setCollectionProducts } from '../services/collection.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listCollectionsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listCollections()); } catch (e) { next(e); }
}

export async function getCollectionController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getCollectionBySlug(req.params.slug)); } catch (e) { next(e); }
}

export async function createCollectionController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createCollection(req.body); sendCreated(res, { id, ...req.body }); } catch (e) { next(e); }
}

export async function updateCollectionController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateCollection(Number(req.params.id), req.body), 'Collection updated'); } catch (e) { next(e); }
}

export async function deleteCollectionController(req: Request, res: Response, next: NextFunction) {
  try { await deleteCollection(Number(req.params.id)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
}

export async function setCollectionProductsController(req: Request, res: Response, next: NextFunction) {
  try { const result = await setCollectionProducts(Number(req.params.id), req.body.productIds || []); sendSuccess(res, result, 'Products updated'); } catch (e) { next(e); }
}
