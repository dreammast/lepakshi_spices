import type { NextFunction, Request, Response } from 'express';
import { registerCustomer, authenticateCustomer } from '../services/auth.service.js';
import { sendCreated, sendSuccess } from '../utils/response.util.js';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerCustomer(req.body);
    // sanitize passwordHash
    if ((user as any).passwordHash) delete (user as any).passwordHash;
    sendCreated(res, user, 'User registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await authenticateCustomer(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendSuccess(res, user, 'Login successful');
  } catch (error) {
    next(error);
  }
}
