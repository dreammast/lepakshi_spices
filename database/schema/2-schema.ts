// database/schema/schema.ts
//
// Drop-in replacement for the existing schema file. It keeps every table you
// already had (categories, products, productVariants, productImages,
// customerProfiles, addresses, carts, cartItems, wishlists, wishlistItems,
// orders, orderItems, reviews, websiteSettings, wholesaleInquiries,
// quotations) and adds every table needed to back the admin screens that are
// currently only writing to localStorage (coupons, collections, campaigns,
// recipes, audit log, bulk packaging, PDF catalog history, quotation line
// items).
//
// Singleton / config-style admin screens (contact settings, tax settings,
// homepage hero, homepage CMS blocks, footer, policies, catalog settings,
// PDF template, timeline) do NOT need their own tables — they map cleanly
// onto the `websiteSettings` key/value table that already exists. Store each
// screen's config as one row: key = "contact_settings", value = JSON.stringify({...}).
// This avoids ~10 near-identical singleton tables.

import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  decimal,
  datetime,
  boolean,
  json,
  mysqlEnum,
  uniqueIndex,
  index
} from 'drizzle-orm/mysql-core';

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull(),
  description: text('description'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug)
}));

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
}, (table) => ({
  slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  categoryIdx: index('products_category_idx').on(table.categoryId)
}));

export const productVariants = mysqlTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  sku: varchar('sku', { length: 64 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  attributes: json('attributes').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  skuIdx: uniqueIndex('product_variants_sku_idx').on(table.sku),
  productIdx: index('product_variants_product_idx').on(table.productId)
}));

export const productImages = mysqlTable('product_images', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: datetime('created_at').notNull()
}, (table) => ({
  productIdx: index('product_images_product_idx').on(table.productId)
}));

// NEW: admin "Collections" screen (curated groupings of products, e.g.
// "Festive Gift Boxes", "Best Sellers")
export const collections = mysqlTable('collections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 512 }),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  slugIdx: uniqueIndex('collections_slug_idx').on(table.slug)
}));

export const collectionProducts = mysqlTable('collection_products', {
  id: serial('id').primaryKey(),
  collectionId: int('collection_id').notNull(),
  productId: int('product_id').notNull(),
  sortOrder: int('sort_order').notNull().default(0)
}, (table) => ({
  collectionIdx: index('collection_products_collection_idx').on(table.collectionId),
  productIdx: index('collection_products_product_idx').on(table.productId),
  uniquePair: uniqueIndex('collection_products_unique').on(table.collectionId, table.productId)
}));

// NEW: admin "Bulk Packaging" screen (wholesale pack sizes per product,
// e.g. 5kg / 25kg sacks with their own price + MOQ)
export const bulkPackaging = mysqlTable('bulk_packaging', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  packLabel: varchar('pack_label', { length: 100 }).notNull(), // e.g. "25kg Sack"
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  minOrderQty: int('min_order_qty').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  productIdx: index('bulk_packaging_product_idx').on(table.productId)
}));

// ---------------------------------------------------------------------------
// Customers / auth
// ---------------------------------------------------------------------------

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
}, (table) => ({
  emailIdx: uniqueIndex('customer_profiles_email_idx').on(table.email)
}));
// NOTE: the admin "Customers" screen does not need its own table — it's just
// a query over customerProfiles (role='customer') joined with orders for
// order-count / lifetime-value columns.

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
}, (table) => ({
  customerIdx: index('addresses_customer_idx').on(table.customerId)
}));

// ---------------------------------------------------------------------------
// Cart / wishlist
// ---------------------------------------------------------------------------

export const carts = mysqlTable('carts', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  customerIdx: uniqueIndex('carts_customer_idx').on(table.customerId)
}));

export const cartItems = mysqlTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: int('cart_id').notNull(),
  productVariantId: int('product_variant_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 12, scale: 2 }).notNull()
}, (table) => ({
  cartIdx: index('cart_items_cart_idx').on(table.cartId)
}));

export const wishlists = mysqlTable('wishlists', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  customerIdx: uniqueIndex('wishlists_customer_idx').on(table.customerId)
}));

export const wishlistItems = mysqlTable('wishlist_items', {
  id: serial('id').primaryKey(),
  wishlistId: int('wishlist_id').notNull(),
  productId: int('product_id').notNull(),
  createdAt: datetime('created_at').notNull()
}, (table) => ({
  wishlistIdx: index('wishlist_items_wishlist_idx').on(table.wishlistId)
}));

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = mysqlTable('orders', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'cancelled', 'refunded']).notNull().default('pending'),
  couponCode: varchar('coupon_code', { length: 32 }),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingAddressId: int('shipping_address_id'),
  billingAddressId: int('billing_address_id'),
  placedAt: datetime('placed_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  customerIdx: index('orders_customer_idx').on(table.customerId),
  statusIdx: index('orders_status_idx').on(table.status)
}));

export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: int('order_id').notNull(),
  productVariantId: int('product_variant_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 12, scale: 2 }).notNull()
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId)
}));

// ---------------------------------------------------------------------------
// Reviews (admin UI calls these "testimonials")
// ---------------------------------------------------------------------------

export const reviews = mysqlTable('reviews', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  customerId: int('customer_id').notNull(),
  rating: int('rating').notNull().default(5),
  comment: text('comment'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).notNull().default('pending'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  productIdx: index('reviews_product_idx').on(table.productId),
  statusIdx: index('reviews_status_idx').on(table.status)
}));

// ---------------------------------------------------------------------------
// Marketing: coupons & campaigns
// ---------------------------------------------------------------------------

export const coupons = mysqlTable('coupons', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 32 }).notNull(),
  type: mysqlEnum('type', ['percentage', 'fixed']).notNull(),
  value: decimal('value', { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 12, scale: 2 }),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 12, scale: 2 }),
  usageLimit: int('usage_limit'),
  usedCount: int('used_count').notNull().default(0),
  startsAt: datetime('starts_at'),
  expiresAt: datetime('expires_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  codeIdx: uniqueIndex('coupons_code_idx').on(table.code)
}));

// Covers both "campaign alert banner" and "campaign popup modal" screens —
// one row per campaign, differentiated by `placement`.
export const campaigns = mysqlTable('campaigns', {
  id: serial('id').primaryKey(),
  placement: mysqlEnum('placement', ['alert_banner', 'popup_modal']).notNull(),
  title: varchar('title', { length: 200 }),
  message: text('message').notNull(),
  ctaLabel: varchar('cta_label', { length: 80 }),
  ctaUrl: varchar('cta_url', { length: 512 }),
  imageUrl: varchar('image_url', { length: 512 }),
  isActive: boolean('is_active').notNull().default(false),
  startsAt: datetime('starts_at'),
  endsAt: datetime('ends_at'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  placementIdx: index('campaigns_placement_idx').on(table.placement)
}));

// ---------------------------------------------------------------------------
// Content: recipes
// ---------------------------------------------------------------------------

export const recipes = mysqlTable('recipes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 512 }),
  ingredients: json('ingredients').$type<string[]>(),
  steps: json('steps').$type<string[]>(),
  relatedProductIds: json('related_product_ids').$type<number[]>(),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  slugIdx: uniqueIndex('recipes_slug_idx').on(table.slug)
}));

// ---------------------------------------------------------------------------
// Site configuration (generic key/value store)
// ---------------------------------------------------------------------------
// One row per admin "settings" screen. Suggested keys:
//   'contact_settings', 'tax_settings', 'homepage_hero', 'homepage_cms',
//   'footer', 'policies', 'catalog_settings', 'pdf_template', 'timeline'
// `value` holds JSON.stringify(...) of whatever shape that screen needs.

export const websiteSettings = mysqlTable('website_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 128 }).notNull(),
  value: text('value').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  keyIdx: uniqueIndex('website_settings_key_idx').on(table.key)
}));

// ---------------------------------------------------------------------------
// Wholesale
// ---------------------------------------------------------------------------

export const wholesaleInquiries = mysqlTable('wholesale_inquiries', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id'),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 32 }),
  message: text('message'),
  status: mysqlEnum('status', ['new', 'reviewing', 'quoted', 'closed']).notNull().default('new'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  statusIdx: index('wholesale_inquiries_status_idx').on(table.status)
}));

export const quotations = mysqlTable('quotations', {
  id: serial('id').primaryKey(),
  inquiryId: int('inquiry_id').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'sent', 'accepted', 'rejected']).notNull().default('draft'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  inquiryIdx: index('quotations_inquiry_idx').on(table.inquiryId)
}));

// NEW: quotations previously had no line items at all
export const quotationItems = mysqlTable('quotation_items', {
  id: serial('id').primaryKey(),
  quotationId: int('quotation_id').notNull(),
  productId: int('product_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 12, scale: 2 }).notNull()
}, (table) => ({
  quotationIdx: index('quotation_items_quotation_idx').on(table.quotationId)
}));

// ---------------------------------------------------------------------------
// Admin tooling: PDF catalog generator + audit log
// ---------------------------------------------------------------------------

export const pdfCatalogHistory = mysqlTable('pdf_catalog_history', {
  id: serial('id').primaryKey(),
  generatedBy: int('generated_by'), // customerProfiles.id of the admin user
  productIds: json('product_ids').$type<number[]>().notNull(),
  templateKey: varchar('template_key', { length: 80 }),
  fileUrl: varchar('file_url', { length: 512 }),
  createdAt: datetime('created_at').notNull()
});

// Tracks admin actions for accountability (who changed what, and when) —
// this is what should back the admin "Audit Log" screen.
export const auditLogs = mysqlTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: int('actor_id'),
  actorEmail: varchar('actor_email', { length: 255 }),
  action: varchar('action', { length: 80 }).notNull(), // e.g. 'product.update'
  entityType: varchar('entity_type', { length: 80 }).notNull(), // e.g. 'product'
  entityId: varchar('entity_id', { length: 64 }),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull()
}, (table) => ({
  entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  actorIdx: index('audit_logs_actor_idx').on(table.actorId)
}));
