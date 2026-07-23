import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import {
  createAddressController,
  deleteAddressController,
  listAddressesController,
  updateAddressController
} from '../controllers/address.controller.js';

const router = Router();
router.use(authenticate);

const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional()
});

router.get('/', asyncHandler(listAddressesController));
router.post('/', validateBody(addressSchema), asyncHandler(createAddressController));
router.put('/:id', validateBody(addressSchema.partial()), asyncHandler(updateAddressController));
router.delete('/:id', asyncHandler(deleteAddressController));

export default router;
