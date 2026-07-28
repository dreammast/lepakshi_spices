import { Router } from 'express';
import {
  registerController,
  loginController,
  meController,
  adminLoginController,
  logoutController,
  syncOAuthController,
  forgotPasswordController,
  verifyResetOtpController,
  resetPasswordController,
  changePasswordController,
  updateProfileController,
  sendVerificationEmailController,
  verifyEmailController,
  verifyEmailLinkController,
  googleCallbackController,
  syncFirebaseController,
} from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional()
});

const googleCallbackSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional()
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string()
});

router.post('/register', validateBody(registerSchema), asyncHandler(registerController));
router.post('/login', validateBody(loginSchema), asyncHandler(loginController));
router.post('/admin/login', validateBody(adminLoginSchema), asyncHandler(adminLoginController));
router.post('/admin/logout', authenticate, asyncHandler(logoutController));
router.get('/me', authenticate, asyncHandler(meController));

router.post('/sync-oauth', validateBody(googleCallbackSchema), asyncHandler(syncOAuthController));
router.post('/sync-firebase', asyncHandler(syncFirebaseController));
router.post('/google/callback', validateBody(googleCallbackSchema), asyncHandler(googleCallbackController));

router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(forgotPasswordController));
router.post('/verify-reset-otp', validateBody(verifyOtpSchema), asyncHandler(verifyResetOtpController));
router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(resetPasswordController));
router.post('/change-password', authenticate, validateBody(changePasswordSchema), asyncHandler(changePasswordController));

router.post('/update-profile', authenticate, validateBody(updateProfileSchema), asyncHandler(updateProfileController));

router.post('/send-verification-email', authenticate, asyncHandler(sendVerificationEmailController));
router.post('/verify-email', validateBody(verifyEmailSchema), asyncHandler(verifyEmailController));
router.get('/verify-email', asyncHandler(verifyEmailLinkController));

export default router;

