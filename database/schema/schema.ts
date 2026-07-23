import { bigint, index, mysqlEnum, mysqlTable, serial, varchar, text, int, decimal, datetime, timestamp, boolean, json, uniqueIndex } from 'drizzle-orm/mysql-core';

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
});

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
});

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
  avatarUrl: varchar('avatar_url', { length: 512 }),
  role: mysqlEnum('role', ['customer', 'staff', 'manager', 'admin']).notNull().default('customer'),
  segment: mysqlEnum('segment', ['new', 'regular', 'vip', 'wholesale']).notNull().default('new'),
  isActive: boolean('is_active').notNull().default(true),
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
  billingAddressId: int('billing_address_id'),
  placedAt: datetime('placed_at').notNull(),
  deliveredAt: datetime('delivered_at'),
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
  title: varchar('title', { length: 255 }),
  displayName: varchar('display_name', { length: 128 }),
  comment: text('comment'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).notNull().default('pending'),
  isFeatured: boolean('is_featured').notNull().default(false),
  approvedAt: datetime('approved_at'),
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
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  assignedToCustomerId: int('assigned_to_customer_id'),
  priority: mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
  source: varchar('source', { length: 80 }).notNull().default('storefront'),
  desiredDeliveryDate: datetime('desired_delivery_date'),
  message: text('message'),
  status: mysqlEnum('status', ['new', 'reviewing', 'quoted', 'contacted', 'quotation_sent', 'negotiation', 'converted', 'completed', 'rejected', 'closed']).notNull().default('new'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

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
});

// Product management, inventory, and bundle-builder support.
export const productCollections = mysqlTable('product_collections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  slug: varchar('slug', { length: 160 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 512 }),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: int('display_order').notNull().default(0),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({ slugUnique: uniqueIndex('product_collections_slug_unique').on(table.slug) }));

export const productCollectionItems = mysqlTable('product_collection_items', {
  id: serial('id').primaryKey(),
  collectionId: int('collection_id').notNull(),
  productId: int('product_id').notNull(),
  displayOrder: int('display_order').notNull().default(0),
  createdAt: datetime('created_at').notNull()
}, (table) => ({ collectionProductUnique: uniqueIndex('product_collection_items_unique').on(table.collectionId, table.productId) }));

export const productBundles = mysqlTable('product_bundles', {
  id: serial('id').primaryKey(),
  productId: int('product_id').notNull(),
  bundleType: mysqlEnum('bundle_type', ['fixed', 'build_your_own']).notNull().default('fixed'),
  minItems: int('min_items').notNull().default(1),
  maxItems: int('max_items'),
  discountType: mysqlEnum('discount_type', ['percentage', 'fixed']).notNull().default('percentage'),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull().default('0'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const productBundleItems = mysqlTable('product_bundle_items', {
  id: serial('id').primaryKey(),
  bundleId: int('bundle_id').notNull(),
  productVariantId: int('product_variant_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  isOptional: boolean('is_optional').notNull().default(false),
  createdAt: datetime('created_at').notNull()
});

export const inventoryMovements = mysqlTable('inventory_movements', {
  id: serial('id').primaryKey(),
  productVariantId: int('product_variant_id').notNull(),
  movementType: mysqlEnum('movement_type', ['opening', 'adjustment', 'sale', 'return', 'restock', 'damage', 'reserved', 'released']).notNull(),
  quantityDelta: int('quantity_delta').notNull(),
  referenceType: varchar('reference_type', { length: 64 }),
  referenceId: varchar('reference_id', { length: 64 }),
  note: text('note'),
  createdByCustomerId: int('created_by_customer_id'),
  createdAt: datetime('created_at').notNull()
}, (table) => ({ variantCreatedIdx: index('inventory_movements_variant_created_idx').on(table.productVariantId, table.createdAt) }));

export const bulkPackagingOptions = mysqlTable('bulk_packaging_options', {
  id: serial('id').primaryKey(),
  productVariantId: int('product_variant_id'),
  label: varchar('label', { length: 128 }).notNull(),
  weightGrams: int('weight_grams').notNull(),
  minQuantity: int('min_quantity').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

// Checkout, fulfilment, customer account, and storefront notification support.
export const orderPayments = mysqlTable('order_payments', {
  id: serial('id').primaryKey(),
  orderId: int('order_id').notNull(),
  provider: varchar('provider', { length: 64 }).notNull(),
  providerPaymentId: varchar('provider_payment_id', { length: 255 }),
  method: varchar('method', { length: 64 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  status: mysqlEnum('status', ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded']).notNull().default('pending'),
  paidAt: datetime('paid_at'),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const shipments = mysqlTable('shipments', {
  id: serial('id').primaryKey(),
  orderId: int('order_id').notNull(),
  carrier: varchar('carrier', { length: 128 }),
  service: varchar('service', { length: 128 }),
  trackingNumber: varchar('tracking_number', { length: 128 }),
  status: mysqlEnum('status', ['pending', 'packed', 'shipped', 'in_transit', 'delivered', 'returned', 'lost']).notNull().default('pending'),
  shippedAt: datetime('shipped_at'),
  deliveredAt: datetime('delivered_at'),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const orderStatusHistory = mysqlTable('order_status_history', {
  id: serial('id').primaryKey(),
  orderId: int('order_id').notNull(),
  status: varchar('status', { length: 64 }).notNull(),
  note: text('note'),
  changedByCustomerId: int('changed_by_customer_id'),
  createdAt: datetime('created_at').notNull()
});

export const customerNotificationPreferences = mysqlTable('customer_notification_preferences', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  orderUpdates: boolean('order_updates').notNull().default(true),
  promotions: boolean('promotions').notNull().default(true),
  newArrivals: boolean('new_arrivals').notNull().default(false),
  newsletter: boolean('newsletter').notNull().default(false),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({ customerUnique: uniqueIndex('customer_notification_preferences_customer_unique').on(table.customerId) }));

export const notifications = mysqlTable('notifications', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  channel: mysqlEnum('channel', ['in_app', 'email', 'sms', 'whatsapp']).notNull().default('in_app'),
  type: varchar('type', { length: 80 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  actionUrl: varchar('action_url', { length: 512 }),
  isRead: boolean('is_read').notNull().default(false),
  readAt: datetime('read_at'),
  createdAt: datetime('created_at').notNull()
}, (table) => ({ customerReadIdx: index('notifications_customer_read_idx').on(table.customerId, table.isRead) }));

export const newsletterSubscribers = mysqlTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  customerId: int('customer_id'),
  status: mysqlEnum('status', ['subscribed', 'unsubscribed', 'bounced']).notNull().default('subscribed'),
  source: varchar('source', { length: 80 }).notNull().default('storefront'),
  subscribedAt: datetime('subscribed_at').notNull(),
  unsubscribedAt: datetime('unsubscribed_at')
}, (table) => ({ emailUnique: uniqueIndex('newsletter_subscribers_email_unique').on(table.email) }));

export const supportTickets = mysqlTable('support_tickets', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['open', 'pending', 'resolved', 'closed']).notNull().default('open'),
  priority: mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
  assignedToCustomerId: int('assigned_to_customer_id'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const supportMessages = mysqlTable('support_messages', {
  id: serial('id').primaryKey(),
  ticketId: int('ticket_id').notNull(),
  senderCustomerId: int('sender_customer_id'),
  senderType: mysqlEnum('sender_type', ['customer', 'staff', 'system']).notNull(),
  body: text('body').notNull(),
  createdAt: datetime('created_at').notNull()
});

export const customerRecentlyViewed = mysqlTable('customer_recently_viewed', {
  id: serial('id').primaryKey(),
  customerId: int('customer_id').notNull(),
  productId: int('product_id').notNull(),
  viewedAt: datetime('viewed_at').notNull()
}, (table) => ({ customerProductUnique: uniqueIndex('customer_recently_viewed_unique').on(table.customerId, table.productId) }));

// Promotion and campaign support used by cart, coupons, and admin marketing tabs.
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
}, (table) => ({ codeUnique: uniqueIndex('coupons_code_unique').on(table.code) }));

export const couponRedemptions = mysqlTable('coupon_redemptions', {
  id: serial('id').primaryKey(),
  couponId: int('coupon_id').notNull(),
  customerId: int('customer_id').notNull(),
  orderId: int('order_id').notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull(),
  redeemedAt: datetime('redeemed_at').notNull()
});

export const taxRates = mysqlTable('tax_rates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  country: varchar('country', { length: 2 }).notNull().default('IN'),
  state: varchar('state', { length: 128 }),
  rate: decimal('rate', { precision: 6, scale: 3 }).notNull(),
  isInclusive: boolean('is_inclusive').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const promotionalCampaigns = mysqlTable('promotional_campaigns', {
  id: serial('id').primaryKey(),
  campaignType: mysqlEnum('campaign_type', ['announcement', 'popup', 'banner', 'email']).notNull(),
  title: varchar('title', { length: 255 }),
  body: text('body').notNull(),
  ctaLabel: varchar('cta_label', { length: 128 }),
  ctaUrl: varchar('cta_url', { length: 512 }),
  imageUrl: varchar('image_url', { length: 512 }),
  startsAt: datetime('starts_at'),
  endsAt: datetime('ends_at'),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

// Website CMS, recipe, testimonial, and document-catalogue support.
export const contentPages = mysqlTable('content_pages', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  status: mysqlEnum('status', ['draft', 'published', 'archived']).notNull().default('draft'),
  publishedAt: datetime('published_at'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({ slugUnique: uniqueIndex('content_pages_slug_unique').on(table.slug) }));

export const contentBlocks = mysqlTable('content_blocks', {
  id: serial('id').primaryKey(),
  pageId: int('page_id').notNull(),
  blockType: varchar('block_type', { length: 80 }).notNull(),
  blockKey: varchar('block_key', { length: 128 }).notNull(),
  content: json('content').$type<Record<string, unknown>>().notNull(),
  displayOrder: int('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
}, (table) => ({ pageBlockUnique: uniqueIndex('content_blocks_page_block_unique').on(table.pageId, table.blockKey) }));

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
}, (table) => ({ slugUnique: uniqueIndex('recipes_slug_unique').on(table.slug) }));

export const recipeIngredients = mysqlTable('recipe_ingredients', {
  id: serial('id').primaryKey(),
  recipeId: int('recipe_id').notNull(),
  productId: int('product_id'),
  description: varchar('description', { length: 512 }).notNull(),
  quantity: varchar('quantity', { length: 128 }),
  displayOrder: int('display_order').notNull().default(0)
});

export const recipeSteps = mysqlTable('recipe_steps', {
  id: serial('id').primaryKey(),
  recipeId: int('recipe_id').notNull(),
  instruction: text('instruction').notNull(),
  imageUrl: varchar('image_url', { length: 512 }),
  displayOrder: int('display_order').notNull().default(0)
});

export const documentTemplates = mysqlTable('document_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  documentType: mysqlEnum('document_type', ['catalogue', 'quotation', 'invoice']).notNull(),
  template: json('template').$type<Record<string, unknown>>().notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdByCustomerId: int('created_by_customer_id'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

export const documentExports = mysqlTable('document_exports', {
  id: serial('id').primaryKey(),
  templateId: int('template_id'),
  documentType: mysqlEnum('document_type', ['catalogue', 'quotation', 'invoice']).notNull(),
  referenceType: varchar('reference_type', { length: 64 }),
  referenceId: varchar('reference_id', { length: 64 }),
  fileUrl: varchar('file_url', { length: 512 }).notNull(),
  createdByCustomerId: int('created_by_customer_id'),
  createdAt: datetime('created_at').notNull()
});

export const mediaAssets = mysqlTable('media_assets', {
  id: serial('id').primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  mimeType: varchar('mime_type', { length: 128 }),
  sizeBytes: int('size_bytes'),
  uploadedByCustomerId: int('uploaded_by_customer_id'),
  createdAt: datetime('created_at').notNull()
});

// Wholesale desk and quotation-builder support.
export const wholesaleInquiryItems = mysqlTable('wholesale_inquiry_items', {
  id: serial('id').primaryKey(),
  inquiryId: int('inquiry_id').notNull(),
  productId: int('product_id'),
  productName: varchar('product_name', { length: 255 }),
  requestedPackaging: varchar('requested_packaging', { length: 128 }),
  requestedQuantity: decimal('requested_quantity', { precision: 12, scale: 3 }),
  quantityUnit: varchar('quantity_unit', { length: 32 }).notNull().default('kg'),
  createdAt: datetime('created_at').notNull()
});

export const wholesaleInquiryNotes = mysqlTable('wholesale_inquiry_notes', {
  id: serial('id').primaryKey(),
  inquiryId: int('inquiry_id').notNull(),
  note: text('note').notNull(),
  createdByCustomerId: int('created_by_customer_id'),
  createdAt: datetime('created_at').notNull()
});

export const wholesaleInquiryFollowUps = mysqlTable('wholesale_inquiry_follow_ups', {
  id: serial('id').primaryKey(),
  inquiryId: int('inquiry_id').notNull(),
  scheduledFor: datetime('scheduled_for').notNull(),
  note: text('note'),
  status: mysqlEnum('status', ['scheduled', 'completed', 'cancelled']).notNull().default('scheduled'),
  completedAt: datetime('completed_at'),
  createdByCustomerId: int('created_by_customer_id'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull()
});

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
});

export const quotationTerms = mysqlTable('quotation_terms', {
  id: serial('id').primaryKey(),
  quotationId: int('quotation_id').notNull(),
  term: text('term').notNull(),
  displayOrder: int('display_order').notNull().default(0)
});

export const quotationEvents = mysqlTable('quotation_events', {
  id: serial('id').primaryKey(),
  quotationId: int('quotation_id').notNull(),
  eventType: varchar('event_type', { length: 80 }).notNull(),
  description: text('description').notNull(),
  createdByCustomerId: int('created_by_customer_id'),
  createdAt: datetime('created_at').notNull()
});

export const auditLogs = mysqlTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorCustomerId: int('actor_customer_id'),
  action: varchar('action', { length: 128 }).notNull(),
  entityType: varchar('entity_type', { length: 128 }).notNull(),
  entityId: varchar('entity_id', { length: 64 }),
  details: json('details').$type<Record<string, unknown>>(),
  createdAt: datetime('created_at').notNull()
}, (table) => ({ entityCreatedIdx: index('audit_logs_entity_created_idx').on(table.entityType, table.entityId, table.createdAt) }));

export const healthCheck = mysqlTable('health_check', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  message: varchar('message', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// API-facing collection tables (alongside product_collections)
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
}, (table) => ({ slugIdx: uniqueIndex('collections_slug_idx').on(table.slug) }));

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
}, (table) => ({ productIdx: index('bulk_packaging_product_idx').on(table.productId) }));

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
}, (table) => ({ placementIdx: index('campaigns_placement_idx').on(table.placement) }));

export const pdfCatalogHistory = mysqlTable('pdf_catalog_history', {
  id: serial('id').primaryKey(),
  generatedBy: int('generated_by'),
  productIds: json('product_ids').$type<number[]>().notNull(),
  templateKey: varchar('template_key', { length: 80 }),
  fileUrl: varchar('file_url', { length: 512 }),
  createdAt: datetime('created_at').notNull()
});

