import type { NextFunction, Request, Response } from 'express';
import { registerCustomer } from '../services/auth.service.js';
import { sendCreated } from '../utils/response.util.js';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerCustomer(req.body);
    sendCreated(res, user, 'User registered successfully');
  } catch (error) {
    next(error);
  }
}
