import { Router } from 'express';
import { registerController, loginController, meController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  // lastName may be omitted by users with single-word names; accept optional and default server-side
  lastName: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/register', validateBody(registerSchema), asyncHandler(registerController));
router.post('/login', validateBody(loginSchema), asyncHandler(loginController));
router.get('/me', authenticate, asyncHandler(meController));

export default router;
