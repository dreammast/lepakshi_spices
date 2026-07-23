import type { Request, Response, NextFunction } from 'express';
import { listProductPackaging, createPackaging, updatePackaging, deletePackaging } from '../services/packaging.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listPackagingController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listProductPackaging(Number(req.params.id))); } catch (e) { next(e); }
}

export async function createPackagingController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createPackaging(Number(req.params.id), req.body); sendCreated(res, { id, ...req.body }); } catch (e) { next(e); }
}

export async function updatePackagingController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updatePackaging(Number(req.params.id), req.body), 'Packaging updated'); } catch (e) { next(e); }
}

export async function deletePackagingController(req: Request, res: Response, next: NextFunction) {
  try { await deletePackaging(Number(req.params.id)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
}
