import type { NextFunction, Request, Response } from 'express';
import {
  registerCustomer,
  authenticateCustomer,
  authenticateAdmin,
  getCustomerProfile,
  syncOAuthUser,
  sendForgotPasswordOtp,
  verifyResetOtp,
  resetPassword,
  changePassword,
  updateProfile,
  sendVerificationEmail,
  verifyEmail,
  exchangeSessionForJwt,
} from '../services/auth.service.js';
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

export async function syncOAuthController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await syncOAuthUser(req.body);
    sendSuccess(res, result, 'User synced successfully');
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const result = await sendForgotPasswordOtp(email);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function verifyResetOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    await verifyResetOtp(email, otp);
    sendSuccess(res, { message: 'Verification code is valid.' });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp, newPassword } = req.body;
    await verifyResetOtp(email, otp);
    const result = await resetPassword(email, newPassword);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(req.user.sub, currentPassword, newPassword);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateProfileController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const result = await updateProfile(req.user.sub, req.body);
    sendSuccess(res, result, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function sendVerificationEmailController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const email = req.user?.email || req.body.email;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const result = await sendVerificationEmail(email);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function verifyEmailController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, token } = req.body;
    const result = await verifyEmail(email, token);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function googleCallbackController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, firstName, lastName, avatarUrl } = req.body;
    const result = await syncOAuthUser({
      email,
      firstName,
      lastName,
      avatarUrl,
      provider: 'google',
    });
    sendSuccess(res, result, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
}

export async function sessionJwtController(req: Request, res: Response, next: NextFunction) {
  try {
    const { authInstance } = await import('../config/better-auth.js');
    const { fromNodeHeaders } = await import('better-auth/node');
    const session = await authInstance.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ success: false, message: 'No active session' });
    }
    const result = await exchangeSessionForJwt(session);
    sendSuccess(res, result, 'Session exchanged successfully');
  } catch (error) {
    next(error);
  }
}
