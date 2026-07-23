import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { cartItems, carts, productVariants, products, wishlistItems, wishlists } from '../db/schema.js';

export async function getOrCreateCart(customerId: number) {
  const [existing] = await db.select().from(carts).where(eq(carts.customerId, customerId));
  if (existing) return existing;

  const now = new Date();
  const [res] = await db.insert(carts).values({ customerId, createdAt: now, updatedAt: now });
  const [cart] = await db.select().from(carts).where(eq(carts.id, res.insertId));
  return cart!;
}

export async function getCartItems(cartId: number) {
  return db
    .select({ item: cartItems, variant: productVariants, product: products })
    .from(cartItems)
    .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
    .leftJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));
}

export async function upsertCartItem(cartId: number, productVariantId: number, quantity: number, price: string) {
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productVariantId, productVariantId)));

  if (existing) {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, existing.id));
      return null;
    }
    await db.update(cartItems).set({ quantity, price }).where(eq(cartItems.id, existing.id));
    return { ...existing, quantity, price };
  }

  if (quantity <= 0) return null;

  const [res] = await db.insert(cartItems).values({ cartId, productVariantId, quantity, price });
  const [created] = await db.select().from(cartItems).where(eq(cartItems.id, res.insertId));
  return created;
}

export async function clearCartItems(cartId: number) {
  return db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function getOrCreateWishlist(customerId: number) {
  const [existing] = await db.select().from(wishlists).where(eq(wishlists.customerId, customerId));
  if (existing) return existing;

  const now = new Date();
  const [res] = await db.insert(wishlists).values({ customerId, createdAt: now, updatedAt: now });
  const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, res.insertId));
  return wishlist!;
}

export async function getWishlistItems(wishlistId: number) {
  return db
    .select({ item: wishlistItems, product: products })
    .from(wishlistItems)
    .leftJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.wishlistId, wishlistId));
}

export async function toggleWishlistItem(wishlistId: number, productId: number) {
  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.wishlistId, wishlistId), eq(wishlistItems.productId, productId)));

  if (existing) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
    return { added: false };
  }

  await db.insert(wishlistItems).values({ wishlistId, productId, createdAt: new Date() });
  return { added: true };
}
