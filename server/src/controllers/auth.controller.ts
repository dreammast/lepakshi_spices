import type { NextFunction, Request, Response } from 'express';
import { registerCustomer, authenticateCustomer, getCustomerProfile } from '../services/auth.service.js';
import { sendCreated, sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerCustomer(req.body);
    sendCreated(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authenticateCustomer(email, password);
    if (!result) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function meController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await getCustomerProfile(req.user.sub);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}
