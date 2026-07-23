import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import {
  createOrderController,
  getOrderController,
  listOrdersController
} from '../controllers/order.controller.js';

const router = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({
    productVariantId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    price: z.union([z.string(), z.number()])
  })).min(1),
  shippingAddressId: z.number().int().optional(),
  billingAddressId: z.number().int().optional(),
  couponCode: z.string().optional(),
  discountAmount: z.union([z.string(), z.number()]).optional()
});

router.post('/', authenticate, validateBody(createOrderSchema), asyncHandler(createOrderController));
router.get('/', authenticate, asyncHandler(listOrdersController));
router.get('/:id', authenticate, asyncHandler(getOrderController));

export default router;
