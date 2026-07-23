import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import {
  clearCartController,
  getCartController,
  getWishlistController,
  toggleWishlistController,
  updateCartItemController
} from '../controllers/cart.controller.js';

const router = Router();
router.use(authenticate);

const cartItemSchema = z.object({
  productVariantId: z.number().int().positive(),
  quantity: z.number().int(),
  price: z.union([z.string(), z.number()])
});

router.get('/', asyncHandler(getCartController));
router.put('/items', validateBody(cartItemSchema), asyncHandler(updateCartItemController));
router.delete('/', asyncHandler(clearCartController));

const wishlistRouter = Router();
wishlistRouter.use(authenticate);
wishlistRouter.get('/', asyncHandler(getWishlistController));
wishlistRouter.post('/toggle', validateBody(z.object({ productId: z.number().int().positive() })), asyncHandler(toggleWishlistController));

export { wishlistRouter };
export default router;
