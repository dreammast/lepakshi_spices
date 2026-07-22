import { Router } from 'express';
import { registerController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

router.post('/register', validateBody(registerSchema), asyncHandler(registerController));

export default router;
