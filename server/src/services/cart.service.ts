import {
  clearCartItems,
  getCartItems,
  getOrCreateCart,
  getOrCreateWishlist,
  getWishlistItems,
  toggleWishlistItem,
  upsertCartItem
} from '../repositories/cart.repository.js';
import { emitUser } from '../realtime/events.js';

export async function getCustomerCart(customerId: number) {
  const cart = await getOrCreateCart(customerId);
  const items = await getCartItems(cart.id);
  return { cart, items };
}

export async function setCartItem(customerId: number, productVariantId: number, quantity: number, price: string) {
  const cart = await getOrCreateCart(customerId);
  await upsertCartItem(cart.id, productVariantId, quantity, price);
  const result = await getCustomerCart(customerId);
  emitUser('cart.changed', { cartId: cart.id, variantId: productVariantId, quantity, at: new Date() }, { userId: customerId });
  return result;
}

export async function emptyCart(customerId: number) {
  const cart = await getOrCreateCart(customerId);
  await clearCartItems(cart.id);
  emitUser('cart.changed', { cartId: cart.id, quantity: 0, cleared: true, at: new Date() }, { userId: customerId });
  return { cart, items: [] };
}

export async function getCustomerWishlist(customerId: number) {
  const wishlist = await getOrCreateWishlist(customerId);
  const items = await getWishlistItems(wishlist.id);
  return { wishlist, items };
}

export async function setWishlistProduct(customerId: number, productId: number) {
  const wishlist = await getOrCreateWishlist(customerId);
  const result = await toggleWishlistItem(wishlist.id, productId);
  emitUser('wishlist.changed', { wishlistId: wishlist.id, productId, added: !!(result?.added ?? true), at: new Date() }, { userId: customerId });
  return result;
}
