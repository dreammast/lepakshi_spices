import type { NextFunction, Request, Response } from 'express';
import { registerCustomer, authenticateCustomer, getCustomerProfile, syncClerkUser } from '../services/auth.service.js';
import { sendCreated, sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { logAudit } from '../utils/audit.js';

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

export async function adminLoginController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authenticateAdmin(req.body.username, req.body.password);
    if (!result) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    await logAudit({ actorCustomerId: 0, action: 'LOGIN', module: 'auth', entityType: 'admin', entityId: 0, ipAddress: req.ip, browser: req.get('user-agent'), updatedData: { username: req.body.username } });
    sendSuccess(res, result, 'Admin login successful');
  } catch (error) { next(error); }
}

export async function logoutController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await logAudit({ actorCustomerId: req.user?.sub, action: 'LOGOUT', module: 'auth', entityType: 'admin', entityId: req.user?.sub, ipAddress: req.ip, browser: req.get('user-agent') });
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) { next(error); }
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

export async function syncClerkController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await syncClerkUser(req.body);
    sendSuccess(res, result, 'User synced successfully');
  } catch (error) {
    next(error);
  }
}
