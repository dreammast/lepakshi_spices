import { desc, eq, and, gte, sql, inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orderItems, orders, productVariants, products, customerProfiles, addresses } from '../db/schema.js';

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

  const orderId = await db.transaction(async (tx) => {
  for (const item of input.items) {
    const result: any = await tx.update(productVariants)
      .set({ stock: sql`${productVariants.stock} - ${item.quantity}`, updatedAt: now })
      .where(and(eq(productVariants.id, item.productVariantId), gte(productVariants.stock, item.quantity)));
    if (!result.affectedRows) throw new Error(`Insufficient stock for product variant ${item.productVariantId}`);
  }

  const [orderRes] = await tx.insert(orders).values({
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

  if (input.items.length > 0) {
    await tx.insert(orderItems).values(
      input.items.map(item => ({
        orderId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.price
      }))
    );
  }
  return orderRes.insertId;
  });
  return findOrderById(orderId);
}

export async function findOrderById(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  let customer = null;
  if (order.customerId) {
    const [c] = await db.select().from(customerProfiles).where(eq(customerProfiles.id, order.customerId));
    if (c) {
      customer = {
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        email: c.email,
        phone: c.phone
      };
    }
  }

  let shippingAddress = null;
  if (order.shippingAddressId) {
    const [addr] = await db.select().from(addresses).where(eq(addresses.id, order.shippingAddressId));
    if (addr) {
      shippingAddress = addr;
    }
  }

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

  const total = Number(order.totalAmount || 0);

  return {
    ...order,
    total,
    customerName: customer ? customer.name : 'Guest Customer',
    customer: customer ? customer.name : 'Guest Customer',
    customerEmail: customer ? customer.email : '',
    customerPhone: customer ? customer.phone : '',
    shippingAddress,
    items: items.map(row => ({
      ...row.item,
      variant: row.variant,
      product: row.product
    }))
  };
}


export async function findOrdersByCustomerId(customerId: number) {
  const rows = await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.placedAt));
  if (rows.length === 0) return [];
  return hydrateOrders(rows);
}

export async function findAllOrders() {
  const rows = await db.select().from(orders).orderBy(desc(orders.placedAt));
  if (rows.length === 0) return [];
  return hydrateOrders(rows);
}

async function hydrateOrders(rows: (typeof orders.$inferSelect)[]) {
  const orderIds = rows.map(r => r.id);

  const customerIds = [...new Set(rows.map(r => r.customerId).filter(Boolean))] as number[];
  const addrIds = [...new Set(rows.map(r => r.shippingAddressId).filter(Boolean))] as number[];

  const [customers, addrs, allItems] = await Promise.all([
    customerIds.length > 0
      ? db.select().from(customerProfiles).where(inArray(customerProfiles.id, customerIds))
      : [],
    addrIds.length > 0
      ? db.select().from(addresses).where(inArray(addresses.id, addrIds))
      : [],
    orderIds.length > 0
      ? db
          .select({ item: orderItems, variant: productVariants, product: products })
          .from(orderItems)
          .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
          .leftJoin(products, eq(productVariants.productId, products.id))
          .where(inArray(orderItems.orderId, orderIds))
      : [],
  ]);

  const customerMap = new Map(customers.map(c => [c.id, c]));
  const addrMap = new Map(addrs.map(a => [a.id, a]));
  type ItemRow = { item: typeof orderItems.$inferSelect; variant: typeof productVariants.$inferSelect | null; product: typeof products.$inferSelect | null };
  const itemsByOrder = new Map<number, ItemRow[]>();
  for (const row of allItems) {
    const oid = row.item.orderId;
    if (!itemsByOrder.has(oid)) itemsByOrder.set(oid, []);
    itemsByOrder.get(oid)!.push(row);
  }

  return rows.map(order => {
    const customer = order.customerId ? customerMap.get(order.customerId) : null;
    const shippingAddress = order.shippingAddressId ? addrMap.get(order.shippingAddressId) : null;
    const items = (itemsByOrder.get(order.id) || []).map(row => ({
      ...row.item,
      variant: row.variant,
      product: row.product,
    }));

    return {
      ...order,
      total: Number(order.totalAmount || 0),
      customerName: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email : 'Guest Customer',
      customer: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email : 'Guest Customer',
      customerEmail: customer ? customer.email : '',
      customerPhone: customer ? customer.phone : '',
      shippingAddress,
      items,
    };
  });
}

export async function updateOrderStatus(id: number, status: typeof orders.$inferInsert.status) {
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  return findOrderById(id);
}
