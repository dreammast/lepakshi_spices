import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { reverseLocationController } from '../controllers/location.controller.js';

const router = Router();
router.get('/reverse', authenticate, asyncHandler(reverseLocationController));
export default router;
