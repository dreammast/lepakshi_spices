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
  shippingAddress: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().optional()
  }).optional(),
  couponCode: z.string().optional(),
  discountAmount: z.union([z.string(), z.number()]).optional(),
  // Payment fields — required for service-level validation to work correctly
  paymentMethod: z.enum(['upi', 'cod']).optional(),
  upiTransactionId: z.string().optional(),
  payerName: z.string().optional()
});

router.post('/', authenticate, validateBody(createOrderSchema), asyncHandler(createOrderController));
router.get('/', authenticate, asyncHandler(listOrdersController));
router.get('/:id', authenticate, asyncHandler(getOrderController));

export default router;
