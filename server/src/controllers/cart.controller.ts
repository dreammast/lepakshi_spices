import type { NextFunction, Response } from 'express';
import { emptyCart, getCustomerCart, getCustomerWishlist, setCartItem, setWishlistProduct } from '../services/cart.service.js';
import { sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

export async function getCartController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const cart = await getCustomerCart(req.user.sub);
    sendSuccess(res, cart);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const { productVariantId, quantity, price } = req.body;
    const cart = await setCartItem(req.user.sub, productVariantId, quantity, String(price));
    sendSuccess(res, cart);
  } catch (error) {
    next(error);
  }
}

export async function clearCartController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const cart = await emptyCart(req.user.sub);
    sendSuccess(res, cart);
  } catch (error) {
    next(error);
  }
}

export async function getWishlistController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const wishlist = await getCustomerWishlist(req.user.sub);
    sendSuccess(res, wishlist);
  } catch (error) {
    next(error);
  }
}

export async function toggleWishlistController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const result = await setWishlistProduct(req.user.sub, req.body.productId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
