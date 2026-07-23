import { desc, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orderItems, orders, productVariants, products } from '../db/schema.js';

export type CreateOrderInput = {
  customerId: number;
  items: { productVariantId: number; quantity: number; price: string }[];
  shippingAddressId?: number;
  billingAddressId?: number;
  couponCode?: string;
  discountAmount?: string;
};

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export async function createOrderRecord(input: CreateOrderInput) {
  const totalAmount = input.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discount = Number(input.discountAmount || 0);
  const now = new Date();

  const [orderRes] = await db.insert(orders).values({
    orderNumber: generateOrderNumber(),
    customerId: input.customerId,
    subtotalAmount: String(totalAmount),
    discountAmount: String(discount),
    taxAmount: '0',
    shippingAmount: '0',
    totalAmount: String(Math.max(0, totalAmount - discount)),
    status: 'pending',
    couponCode: input.couponCode,
    shippingAddressId: input.shippingAddressId,
    billingAddressId: input.billingAddressId,
    placedAt: now,
    updatedAt: now
  });

  const orderId = orderRes.insertId;

  if (input.items.length > 0) {
    await db.insert(orderItems).values(
      input.items.map(item => ({
        orderId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.price
      }))
    );
  }

  return findOrderById(orderId);
}

export async function findOrderById(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  const items = await db
    .select({
      item: orderItems,
      variant: productVariants,
      product: products
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .leftJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, id));

  return {
    ...order,
    items: items.map(row => ({
      ...row.item,
      variant: row.variant,
      product: row.product
    }))
  };
}

export async function findOrdersByCustomerId(customerId: number) {
  const rows = await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.placedAt));
  return Promise.all(rows.map(o => findOrderById(o.id)));
}

export async function findAllOrders() {
  const rows = await db.select().from(orders).orderBy(desc(orders.placedAt));
  return Promise.all(rows.map(o => findOrderById(o.id)));
}

export async function updateOrderStatus(id: number, status: typeof orders.$inferInsert.status) {
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  return findOrderById(id);
}
