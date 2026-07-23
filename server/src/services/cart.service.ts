import {
  clearCartItems,
  getCartItems,
  getOrCreateCart,
  getOrCreateWishlist,
  getWishlistItems,
  toggleWishlistItem,
  upsertCartItem
} from '../repositories/cart.repository.js';

export async function getCustomerCart(customerId: number) {
  const cart = await getOrCreateCart(customerId);
  const items = await getCartItems(cart.id);
  return { cart, items };
}

export async function setCartItem(customerId: number, productVariantId: number, quantity: number, price: string) {
  const cart = await getOrCreateCart(customerId);
  await upsertCartItem(cart.id, productVariantId, quantity, price);
  return getCustomerCart(customerId);
}

export async function emptyCart(customerId: number) {
  const cart = await getOrCreateCart(customerId);
  await clearCartItems(cart.id);
  return { cart, items: [] };
}

export async function getCustomerWishlist(customerId: number) {
  const wishlist = await getOrCreateWishlist(customerId);
  const items = await getWishlistItems(wishlist.id);
  return { wishlist, items };
}

export async function setWishlistProduct(customerId: number, productId: number) {
  const wishlist = await getOrCreateWishlist(customerId);
  return toggleWishlistItem(wishlist.id, productId);
}
