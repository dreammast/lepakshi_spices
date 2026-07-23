import { mysqlTable, serial, varchar, text, int, decimal, datetime, boolean, json, mysqlEnum } from 'drizzle-orm/mysql-core';

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull(),
  description: text('description'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const products = mysqlTable('products', {
  id: serial('id').primaryKey(),
  categoryId: int('category_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 12, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const productVariants = mysqlTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  sku: varchar('sku', { length: 64 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  attributes: json('attributes').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const productImages = mysqlTable('product_images', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: datetime('created_at').notNull()
});

export const customerProfiles = mysqlTable('customer_profiles', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 128 }).notNull(),
  lastName: varchar('last_name', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  role: mysqlEnum('role', ['customer', 'staff', 'manager', 'admin']).notNull().default('customer'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const addresses = mysqlTable('addresses', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  label: varchar('label', { length: 80 }).notNull(),
  line1: varchar('line_1', { length: 255 }).notNull(),
  line2: varchar('line_2', { length: 255 }),
  city: varchar('city', { length: 128 }).notNull(),
  state: varchar('state', { length: 128 }).notNull(),
  postalCode: varchar('postal_code', { length: 32 }).notNull(),
  country: varchar('country', { length: 128 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const carts = mysqlTable('carts', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const cartItems = mysqlTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: int('cart_id').notNull(),
  productVariantId: int('product_variant_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 12, scale: 2 }).notNull()
});

export const wishlists = mysqlTable('wishlists', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const wishlistItems = mysqlTable('wishlist_items', {
  id: serial('id').primaryKey(),
  wishlistId: int('wishlist_id').notNull(),
  productId: int('product_id').notNull(),
  createdAt: datetime('created_at').notNull()
});

export const orders = mysqlTable('orders', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'cancelled', 'refunded']).notNull().default('pending'),
  shippingAddressId: int('shipping_address_id'),
  billingAddressId: int('billing_address_id'),
  placedAt: datetime('placed_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: int('order_id').notNull(),
  productVariantId: int('product_variant_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 12, scale: 2 }).notNull()
});

export const reviews = mysqlTable('reviews', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  customerId: int('customer_id').notNull(),
  rating: int('rating').notNull().default(5),
  comment: text('comment'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).notNull().default('pending'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const websiteSettings = mysqlTable('website_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 128 }).notNull(),
  value: text('value').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const wholesaleInquiries = mysqlTable('wholesale_inquiries', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id'),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  message: text('message'),
  status: mysqlEnum('status', ['new', 'reviewing', 'quoted', 'closed']).notNull().default('new'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const quotations = mysqlTable('quotations', {
  id: serial('id').primaryKey(),
  inquiryId: int('inquiry_id').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'sent', 'accepted', 'rejected']).notNull().default('draft'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

// Additional tables added to match database schema used by front-end / session
export const todos = mysqlTable('todos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['pending','in_progress','done','blocked']).notNull().default('pending'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const todoDeps = mysqlTable('todo_deps', {
  id: serial('id').primaryKey(),
  todoId: int('todo_id').notNull(),
  dependsOn: int('depends_on').notNull()
});

export const inboxEntries = mysqlTable('inbox_entries', {
  id: serial('id').primaryKey(),
  subject: varchar('subject', { length: 255 }),
  message: text('message'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: datetime('created_at').notNull()
});

