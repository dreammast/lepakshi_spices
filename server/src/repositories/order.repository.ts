import { desc, eq, and, gte, sql, inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orderItems, orders, productVariants, products, customerProfiles, addresses } from '../db/schema.js';
import { createAddressRecord } from './address.repository.js';

export type CreateOrderInput = {
  customerId: number;
  items: { productVariantId: number; quantity: number; price: string }[];
  shippingAddressId?: number;
  billingAddressId?: number;
  shippingAddress?: {
    name?: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  couponCode?: string;
  discountAmount?: string;
  shippingAmount?: string;
  paymentMethod?: string;
  upiTransactionId?: string;
  payerName?: string;
};

type ShippingAddressSnapshot = {
  name?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

function normalizeShippingAddress(address: ShippingAddressSnapshot | string | null | undefined) {
  if (!address) return null;
  if (typeof address === 'string') {
    try {
      return JSON.parse(address) as ShippingAddressSnapshot;
    } catch {
      return null;
    }
  }
  return {
    name: address.name || undefined,
    phone: address.phone || undefined,
    line1: address.line1,
    line2: address.line2 || undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country || 'India',
  };
}

function addressRecordToSnapshot(addr: typeof addresses.$inferSelect): ShippingAddressSnapshot {
  return {
    name: addr.fullName || addr.label || undefined,
    phone: addr.phone || undefined,
    line1: addr.line1,
    line2: addr.line2 || undefined,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country || 'India',
  };
}

// The checkout phone lives in the order's shipping_address JSON snapshot. A saved
// address row may be stale (no phone), so when a record lacks a phone/name we fall
// back to the snapshot captured at checkout time so the value is never lost.
function mergeSnapshotOverRecord(record: ShippingAddressSnapshot | null | undefined, snapshot: ShippingAddressSnapshot | null | undefined): ShippingAddressSnapshot | null {
  if (!record) return snapshot || null;
  if (!snapshot) return record;
  return {
    ...record,
    name: record.name || snapshot.name,
    phone: record.phone || snapshot.phone,
  };
}

function logPhone(stage: string, phone: string | undefined | null) {
  console.log(`[phone-flow] ${stage}: ${phone ? `"${phone}"` : '(empty)'}`);
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export async function createOrderRecord(input: CreateOrderInput) {
  const totalAmount = input.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discount = Number(input.discountAmount || 0);
  const shipping = Number(input.shippingAmount || 0);
  const now = new Date();

  let shippingAddressId = input.shippingAddressId;
  const shippingAddressSnapshot = normalizeShippingAddress(input.shippingAddress);
  let shippingAddressSnapshotFromRecord = null;
  if (shippingAddressId && !shippingAddressSnapshot) {
    const [existingAddress] = await db.select().from(addresses).where(eq(addresses.id, shippingAddressId));
    shippingAddressSnapshotFromRecord = existingAddress
      ? {
          name: existingAddress.fullName || existingAddress.label || undefined,
          phone: existingAddress.phone || undefined,
          line1: existingAddress.line1,
          line2: existingAddress.line2 || undefined,
          city: existingAddress.city,
          state: existingAddress.state,
          postalCode: existingAddress.postalCode,
          country: existingAddress.country || 'India',
        }
      : null;
  }
  const finalShippingAddressSnapshot = shippingAddressSnapshot || shippingAddressSnapshotFromRecord;
  logPhone('createOrderRecord: received snapshot', shippingAddressSnapshot?.phone);
  logPhone('createOrderRecord: final snapshot stored', finalShippingAddressSnapshot?.phone);
  if (!shippingAddressId && input.shippingAddress) {
    const createdAddr = await createAddressRecord(input.customerId, {
      label: input.shippingAddress.name || 'Shipping Address',
      fullName: input.shippingAddress.name || undefined,
      phone: input.shippingAddress.phone || undefined,
      line1: input.shippingAddress.line1,
      line2: input.shippingAddress.line2,
      city: input.shippingAddress.city,
      state: input.shippingAddress.state,
      postalCode: input.shippingAddress.postalCode,
      country: input.shippingAddress.country || 'India',
      isDefault: true
    });
    if (createdAddr) {
      shippingAddressId = createdAddr.id;
    }
  }

  // When checkout supplied a phone alongside an existing saved address, persist it
  // onto the address row too so later reads (which prefer the row) keep the value.
  if (shippingAddressId && shippingAddressSnapshot?.phone) {
    await db.update(addresses)
      .set({
        phone: shippingAddressSnapshot.phone,
        fullName: shippingAddressSnapshot.name || undefined,
        updatedAt: now
      })
      .where(eq(addresses.id, shippingAddressId));
  }

  // Build customer note: include UPI transaction details if provided
  const upiNote = input.upiTransactionId
    ? `UPI_UTR:${input.upiTransactionId}${input.payerName ? `|PAYER:${input.payerName}` : ''}`
    : undefined;

  const orderId = await db.transaction(async (tx) => {
    for (const item of input.items) {
      const result: any = await tx.update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${item.quantity}`, updatedAt: now })
        .where(and(eq(productVariants.id, item.productVariantId), gte(productVariants.stock, item.quantity)));
      const affectedRows = Array.isArray(result) ? result[0]?.affectedRows : result?.affectedRows;
      if (!affectedRows) throw new Error(`Insufficient stock for product variant ${item.productVariantId}`);
    }

    const [orderRes] = await tx.insert(orders).values({
      orderNumber: generateOrderNumber(),
      customerId: input.customerId,
      subtotalAmount: String(totalAmount),
      discountAmount: String(discount),
      taxAmount: '0',
      shippingAmount: String(shipping),
      totalAmount: String(Math.max(0, totalAmount - discount + shipping)),
      status: 'pending',
      paymentMethod: input.paymentMethod || null,
      couponCode: input.couponCode,
      customerNote: upiNote || null,
      shippingAddressId: shippingAddressId,
      shippingAddress: finalShippingAddressSnapshot ? JSON.stringify(finalShippingAddressSnapshot) : null,
      billingAddressId: input.billingAddressId,
      placedAt: now,
      updatedAt: now
    });

    const newOrderId = orderRes.insertId;
    if (input.items.length > 0) {
      await tx.insert(orderItems).values(
        input.items.map(item => ({
          orderId: newOrderId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price
        }))
      );
    }
    return newOrderId;
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
      shippingAddress = addressRecordToSnapshot(addr);
    }
  } else if (order.shippingAddress) {
    shippingAddress = normalizeShippingAddress(order.shippingAddress);
  } else if (order.customerId) {
    const [addr] = await db.select().from(addresses).where(eq(addresses.customerId, order.customerId));
    if (addr) {
      shippingAddress = addressRecordToSnapshot(addr);
    }
  }
  // Prefer the phone captured at checkout if the saved address row is stale.
  shippingAddress = mergeSnapshotOverRecord(shippingAddress, normalizeShippingAddress(order.shippingAddress));
  logPhone('findOrderById: returned', shippingAddress?.phone);
  logPhone('findOrderById: customerPhone', customer?.phone);

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

  const fallbackCustomerAddrs = new Map<number, typeof addresses.$inferSelect>();
  const customersWithoutAddr = customerIds.filter(cid => !rows.some(r => r.customerId === cid && r.shippingAddressId));
  if (customersWithoutAddr.length > 0) {
    const defaultAddrs = await db.select().from(addresses).where(inArray(addresses.customerId, customersWithoutAddr));
    for (const a of defaultAddrs) {
      if (!fallbackCustomerAddrs.has(a.customerId) || a.isDefault) {
        fallbackCustomerAddrs.set(a.customerId, a);
      }
    }
  }

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
    const snapshotAddress = normalizeShippingAddress(order.shippingAddress as any);
    let recordAddress: typeof addresses.$inferSelect | undefined;
    if (order.shippingAddressId) {
      recordAddress = addrMap.get(order.shippingAddressId);
    } else if (!snapshotAddress && order.customerId) {
      recordAddress = fallbackCustomerAddrs.get(order.customerId);
    }
    // Prefer the phone captured at checkout if the saved address row is stale.
    const shippingAddress = mergeSnapshotOverRecord(recordAddress ? addressRecordToSnapshot(recordAddress) : snapshotAddress, snapshotAddress);
    logPhone(`hydrateOrders: order ${order.id}`, shippingAddress?.phone);
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

export async function appendOrderTimeline(id: number, events: Array<{ time: string; event: string }>) {
  const [order] = await db.select({ timeline: orders.timeline }).from(orders).where(eq(orders.id, id));
  const existing = Array.isArray(order?.timeline) ? order!.timeline : [];
  await db.update(orders)
    .set({ timeline: [...existing, ...events], updatedAt: new Date() })
    .where(eq(orders.id, id));
  return events.length;
}

export async function verifyOrderPaymentInDb(id: number, adminName: string) {
  await db.update(orders)
    .set({
      paymentStatus: 'verified',
      status: 'processing',
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: adminName,
      updatedAt: new Date()
    })
    .where(eq(orders.id, id));
  return findOrderById(id);
}

