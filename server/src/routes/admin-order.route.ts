import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import { listAdminOrdersController, updateOrderStatusController } from '../controllers/order.controller.js';

const router = Router();

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'returned'])
});

// The existing admin UI does not yet have its own login/token flow. Keep these
// endpoints available to that UI until the admin authentication screen is added.
router.get('/', asyncHandler(listAdminOrdersController));
router.put('/:id/status', validateBody(updateStatusSchema), asyncHandler(updateOrderStatusController));

export default router;
