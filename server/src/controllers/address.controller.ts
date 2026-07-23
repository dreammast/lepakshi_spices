import type { NextFunction, Response } from 'express';
import { addAddress, editAddress, listAddresses, removeAddress } from '../services/address.service.js';
import { sendCreated, sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

export async function listAddressesController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const addresses = await listAddresses(req.user.sub);
    sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
}

export async function createAddressController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const address = await addAddress(req.user.sub, req.body);
    sendCreated(res, address);
  } catch (error) {
    next(error);
  }
}

export async function updateAddressController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const address = await editAddress(req.user.sub, Number(req.params.id), req.body);
    sendSuccess(res, address);
  } catch (error) {
    next(error);
  }
}

export async function deleteAddressController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    await removeAddress(req.user.sub, Number(req.params.id));
    sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
}
