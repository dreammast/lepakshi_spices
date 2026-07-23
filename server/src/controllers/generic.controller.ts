import type { NextFunction, Request, Response } from 'express';
import {
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity
} from '../services/generic.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listEntitiesController(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = req.params.entity;
    const data = await listEntities(entity);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getEntityController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const entity = req.params.entity;
    const data = await getEntity(entity, id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function createEntityController(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = req.params.entity;
    const id = await createEntity(entity, req.body);
    sendCreated(res, { id, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function updateEntityController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const entity = req.params.entity;
    await updateEntity(entity, id, req.body);
    sendSuccess(res, { message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function deleteEntityController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const entity = req.params.entity;
    await deleteEntity(entity, id);
    sendSuccess(res, { message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
}
