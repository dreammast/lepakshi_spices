import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import { listAdminOrdersController, updateOrderStatusController } from '../controllers/order.controller.js';

const router = Router();

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'returned'])
});

router.use(authenticate, requireRole('staff', 'manager', 'admin'));
router.get('/', asyncHandler(listAdminOrdersController));
router.put('/:id/status', validateBody(updateStatusSchema), asyncHandler(updateOrderStatusController));

export default router;
