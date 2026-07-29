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
  imageUrl: varchar('image_url', { length: 512 }),
  displayOrder: int('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
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
  subtitle: varchar('subtitle', { length: 255 }),
  description: text('description'),
  origin: varchar('origin', { length: 255 }),
  badge: varchar('badge', { length: 80 }),
  ingredients: json('ingredients').$type<string[]>(),
  nutritionPer100g: json('nutrition_per_100g').$type<Record<string, string>>(),
  storageInstructions: text('storage_instructions'),
  tags: json('tags').$type<string[]>(),
  basePrice: decimal('base_price', { precision: 12, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  isBundle: boolean('is_bundle').notNull().default(false),
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
  label: varchar('label', { length: 128 }),
  weightGrams: int('weight_grams'),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 12, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }),
  stock: int('stock').notNull().default(0),
  lowStockThreshold: int('low_stock_threshold').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
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

export const bulkPackaging = mysqlTable('bulk_packaging', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  packLabel: varchar('pack_label', { length: 100 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  minOrderQty: int('min_order_qty').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  productIdx: index('bulk_packaging_product_idx').on(table.productId)
}));

// ---------------------------------------------------------------------------
// Customers / Auth
// ---------------------------------------------------------------------------

export const customerProfiles = mysqlTable('customer_profiles', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  firstName: varchar('first_name', { length: 128 }).notNull(),
  lastName: varchar('last_name', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  avatarUrl: varchar('avatar_url', { length: 512 }),
  role: mysqlEnum('role', ['customer', 'staff', 'manager', 'admin']).notNull().default('customer'),
  segment: mysqlEnum('segment', ['new', 'regular', 'vip', 'wholesale']).notNull().default('new'),
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  emailIdx: uniqueIndex('customer_profiles_email_idx').on(table.email)
}));

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
// Cart / Wishlist
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
  orderNumber: varchar('order_number', { length: 64 }).notNull(),
  customerId: int('customer_id').notNull(),
  subtotalAmount: decimal('subtotal_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  status: mysqlEnum('status', ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'returned']).notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 64 }),
  paymentStatus: mysqlEnum('payment_status', ['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded']).notNull().default('pending'),
  couponCode: varchar('coupon_code', { length: 64 }),
  customerNote: text('customer_note'),
  shippingAddressId: int('shipping_address_id'),
  shippingAddress: text('shipping_address'),
  billingAddressId: int('billing_address_id'),
  placedAt: datetime('placed_at').notNull(),
  deliveredAt: datetime('delivered_at'),
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
// Reviews
// ---------------------------------------------------------------------------

export const reviews = mysqlTable('reviews', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  customerId: int('customer_id').notNull(),
  rating: int('rating').notNull().default(5),
  title: varchar('title', { length: 255 }),
  displayName: varchar('display_name', { length: 128 }),
  comment: text('comment'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).notNull().default('pending'),
  isFeatured: boolean('is_featured').notNull().default(false),
  approvedAt: datetime('approved_at'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  productIdx: index('reviews_product_idx').on(table.productId),
  statusIdx: index('reviews_status_idx').on(table.status)
}));

// ---------------------------------------------------------------------------
// Marketing: Coupons & Campaigns
// ---------------------------------------------------------------------------

export const coupons = mysqlTable('coupons', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 64 }).notNull(),
  discountType: mysqlEnum('discount_type', ['percentage', 'fixed']).notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 12, scale: 2 }),
  usageLimit: int('usage_limit'),
  perCustomerLimit: int('per_customer_limit'),
  startsAt: datetime('starts_at'),
  endsAt: datetime('ends_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  codeIdx: uniqueIndex('coupons_code_idx').on(table.code)
}));

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
// Content: Recipes
// ---------------------------------------------------------------------------

export const recipes = mysqlTable('recipes', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 512 }),
  prepMinutes: int('prep_minutes'),
  cookMinutes: int('cook_minutes'),
  servings: int('servings'),
  difficulty: mysqlEnum('difficulty', ['easy', 'medium', 'hard']),
  nutrition: json('nutrition').$type<Record<string, string>>(),
  status: mysqlEnum('status', ['draft', 'published', 'archived']).notNull().default('draft'),
  publishedAt: datetime('published_at'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  slugIdx: uniqueIndex('recipes_slug_idx').on(table.slug)
}));

// ---------------------------------------------------------------------------
// Site configuration (generic key/value store)
// ---------------------------------------------------------------------------

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
// Wholesale & Quotations
// ---------------------------------------------------------------------------

export const wholesaleInquiries = mysqlTable('wholesale_inquiries', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id'),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  assignedToCustomerId: int('assigned_to_customer_id'),
  priority: mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
  source: varchar('source', { length: 80 }).notNull().default('storefront'),
  desiredDeliveryDate: datetime('desired_delivery_date'),
  message: text('message'),
  status: mysqlEnum('status', ['new', 'reviewing', 'quoted', 'contacted', 'quotation_sent', 'negotiation', 'approved', 'processing', 'converted', 'completed', 'rejected', 'cancelled', 'closed']).notNull().default('new'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  statusIdx: index('wholesale_inquiries_status_idx').on(table.status)
}));

export const quotations = mysqlTable('quotations', {
  id: serial('id').primaryKey(),
  quoteNumber: varchar('quote_number', { length: 64 }).notNull(),
  inquiryId: int('inquiry_id').notNull(),
  customerId: int('customer_id'),
  assignedToCustomerId: int('assigned_to_customer_id'),
  billingAddress: text('billing_address'),
  shippingAddress: text('shipping_address'),
  gstin: varchar('gstin', { length: 32 }),
  subtotalAmount: decimal('subtotal_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  paymentTerms: text('payment_terms'),
  leadTimeDays: int('lead_time_days'),
  packagingType: varchar('packaging_type', { length: 128 }),
  deliveryMethod: varchar('delivery_method', { length: 128 }),
  notes: text('notes'),
  validUntil: datetime('valid_until'),
  status: mysqlEnum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).notNull().default('draft'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  inquiryIdx: index('quotations_inquiry_idx').on(table.inquiryId)
}));

export const quotationItems = mysqlTable('quotation_items', {
  id: serial('id').primaryKey(),
  quotationId: int('quotation_id').notNull(),
  productVariantId: int('product_variant_id'),
  productName: varchar('product_name', { length: 255 }).notNull(),
  weightLabel: varchar('weight_label', { length: 128 }),
  quantity: decimal('quantity', { precision: 12, scale: 3 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  discountPercent: decimal('discount_percent', { precision: 6, scale: 3 }).notNull().default('0'),
  taxPercent: decimal('tax_percent', { precision: 6, scale: 3 }).notNull().default('0'),
  lineTotal: decimal('line_total', { precision: 12, scale: 2 }).notNull(),
  displayOrder: int('display_order').notNull().default(0)
}, (table) => ({
  quotationIdx: index('quotation_items_quotation_idx').on(table.quotationId)
}));

// ---------------------------------------------------------------------------
// Admin tooling: PDF catalog generator + audit log
// ---------------------------------------------------------------------------

export const pdfCatalogHistory = mysqlTable('pdf_catalog_history', {
  id: serial('id').primaryKey(),
  generatedBy: int('generated_by'),
  productIds: json('product_ids').$type<number[]>().notNull(),
  templateKey: varchar('template_key', { length: 80 }),
  fileUrl: varchar('file_url', { length: 512 }),
  createdAt: datetime('created_at').notNull()
});

export const auditLogs = mysqlTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorCustomerId: int('actor_customer_id'),
  action: varchar('action', { length: 128 }).notNull(),
  module: varchar('module', { length: 128 }),
  entityType: varchar('entity_type', { length: 128 }).notNull(),
  entityId: varchar('entity_id', { length: 64 }),
  previousData: json('previous_data').$type<Record<string, unknown> | null>(),
  updatedData: json('updated_data').$type<Record<string, unknown> | null>(),
  ipAddress: varchar('ip_address', { length: 64 }),
  browser: varchar('browser', { length: 255 }),
  operatingSystem: varchar('operating_system', { length: 128 }),
  requestId: varchar('request_id', { length: 64 }),
  details: json('details').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull()
}, (table) => ({
  entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  createdIdx: index('audit_logs_created_idx').on(table.createdAt),
  actionIdx: index('audit_logs_action_idx').on(table.action)
}));

// ---------------------------------------------------------------------------
// OTP / Email Verification
// ---------------------------------------------------------------------------

export const emailOtps = mysqlTable('email_otps', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  otpHash: varchar('otp_hash', { length: 64 }).notNull(),
  purpose: mysqlEnum('purpose', ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION']).notNull(),
  expiresAt: datetime('expires_at').notNull(),
  attempts: int('attempts').notNull().default(0),
  verified: boolean('verified').notNull().default(false),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({
  emailIdx: index('email_otps_email_idx').on(table.email),
  purposeIdx: index('email_otps_purpose_idx').on(table.purpose)
}));
