// lib/db/schema.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  primaryKey,
  boolean,
  serial,
  varchar,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique().notNull(),
  password: text('password'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Add these tables to your existing schema
// lib/db/schema.ts
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  isActive: boolean('is_active').default(true).notNull(),
  newsletterOptin: boolean('newsletter_optin').default(false).notNull(),
})
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'billing' or 'shipping'
  isDefault: boolean('is_default').default(false),
  street: text('street').notNull(),
  street2: text('street_2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  images: text('images').array(),
  verifiedPurchase: boolean('verified_purchase').default(false),
  helpfulVotes: integer('helpful_votes').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  styleId: integer('style_id').notNull().unique(),
  name: text('name').notNull(),
  style: text('style').notNull(),
  quantityAvailable: integer('quantity_available').notNull().default(0),
  onSale: text('on_sale').notNull().default('N'),
  isNew: text('is_new').notNull().default('N'),
  smallPicture: text('small_picture'),
  mediumPicture: text('medium_picture'),
  largePicture: text('large_picture'),
  department: text('dept'),
  type: text('typ'),
  subType: text('subtyp'),
  brand: text('brand'),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
  regularPrice: decimal('regular_price', { precision: 10, scale: 2 }).notNull(),
  longDescription: text('long_description'),
  of7: text('of7'),
  of12: text('of12'),
  of13: text('of13'),
  of15: text('of15'),
  forceBuyQtyLimit: text('force_buy_qty_limit'),
  lastReceived: text('last_rcvd'),
  tags: text('tags'),
  urlHandle: text('url_handle'),
  barcode: text('barcode'),
  sku: text('sku'),
  trackInventory: boolean('track_inventory').notNull().default(false),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  continueSellingOutOfStock: boolean('continue_selling_out_of_stock')
    .notNull()
    .default(false),
  lowStockThreshold: integer('low_stock_threshold'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const productVariations = pgTable('product_variations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  skuId: integer('sku_id').notNull(),
  color: text('color').notNull(),
  attr1Alias: text('attr1_alias').notNull(),
  hex: text('hex'),
  size: text('size').notNull(),
  subSize: text('sub_size'),
  quantity: integer('quantity').notNull().default(0),
  colorImage: text('color_image'),
  sku: text('sku'),
  barcode: text('barcode'),
  available: boolean('available').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
// Add relations
export const productAlternateImages = pgTable('product_alternate_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  AltImage: text('AltImage'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  parentId: text('parent_id'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value'),
  type: text('type').notNull(), // 'string', 'number', 'boolean', 'json', 'file'
  group: text('group').notNull(), // 'general', 'branding', 'colors', 'store'
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const attributes = pgTable('attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  display: text('display').notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const attributeValues = pgTable('attribute_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  attributeId: uuid('attribute_id')
    .notNull()
    .references(() => attributes.id),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Add relations
export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
}))

export const attributeValuesRelations = relations(
  attributeValues,
  ({ one }) => ({
    attribute: one(attributes, {
      fields: [attributeValues.attributeId],
      references: [attributes.id],
    }),
  })
)

export const productsRelations = relations(products, ({ many }) => ({
  variations: many(productVariations),
  alternateImages: many(productAlternateImages),
}))

export const productVariationsRelations = relations(
  productVariations,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariations.productId],
      references: [products.id],
    }),
  })
)

export const productAlternateImagesRelations = relations(
  productAlternateImages,
  ({ one }) => ({
    product: one(products, {
      fields: [productAlternateImages.productId],
      references: [products.id],
    }),
  })
)

export const taxonomy = pgTable('taxonomy', {
  WEB_TAXONOMY_ID: serial('WEB_TAXONOMY_ID').primaryKey(),
  DEPT: text('DEPT').notNull(),
  TYP: text('TYP').notNull().default('EMPTY'),
  SUBTYP_1: text('SUBTYP_1').notNull().default('EMPTY'),
  SUBTYP_2: text('SUBTYP_2').notNull().default('EMPTY'),
  SUBTYP_3: text('SUBTYP_3').notNull().default('EMPTY'),
  SORT_POSITION: text('SORT_POSITION'),
  WEB_URL: text('WEB_URL').notNull(),
  LONG_DESCRIPTION: text('LONG_DESCRIPTION'),
  DLU: timestamp('DLU').default(sql`CURRENT_TIMESTAMP`),
  CATEGORY_STYLE: text('CATEGORY_STYLE'),
  SHORT_DESC: text('SHORT_DESC'),
  LONG_DESCRIPTION_2: text('LONG_DESCRIPTION_2'),
  META_TAGS: text('META_TAGS'),
  ACTIVE: integer('ACTIVE').notNull().default(1),
  BACKGROUNDIMAGE: text('BACKGROUNDIMAGE'),
  SHORT_DESC_ON_PAGE: text('SHORT_DESC_ON_PAGE'),
  GOOGLEPRODUCTTAXONOMY: text('GOOGLEPRODUCTTAXONOMY'),
  SITE: integer('SITE').notNull().default(1),
  CATEGORYTEMPLATE: text('CATEGORYTEMPLATE'),
  BESTSELLERBG: text('BESTSELLERBG'),
  NEWARRIVALBG: text('NEWARRIVALBG'),
  PAGEBGCOLOR: text('PAGEBGCOLOR'),
})

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  alias: text('alias').notNull(),
  description: text('description'),
  urlHandle: text('url_handle').notNull(),
  logo: text('logo'),
  showOnCategory: boolean('show_on_category').notNull().default(false),
  showOnProduct: boolean('show_on_product').notNull().default(false),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: varchar('phone', { length: 20 }),
  billingAddress: jsonb('billing_address').$type<{
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }>(),
  shippingAddress: jsonb('shipping_address').$type<{
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  newsletterOptin: boolean('newsletter_optin').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

// Add relations
export const customersRelations = relations(customers, ({ many }) => ({
  reviews: many(reviews),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  customer: one(customers, {
    fields: [reviews.userId],
    references: [customers.id],
  }),
}))

export const taxRates = pgTable('tax_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull(), // Store as percentage (e.g., 8.5 for 8.5%)
  country: text('country').notNull(),
  state: text('state'),
  zipCode: text('zip_code'),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0), // Higher priority rates are applied first
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Add relations for tax rates
export const taxRatesRelations = relations(taxRates, ({ many }) => ({
  orders: many(orders),
}))

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  guestEmail: text('guest_email'),
  status: text('status').notNull().default('pending'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  taxRateId: uuid('tax_rate_id').references(() => taxRates.id),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  paymentMethod: text('payment_method'),
  shippingAddressId: uuid('shipping_address_id').references(() => addresses.id),
  billingAddressId: uuid('billing_address_id').references(() => addresses.id),
  shippingMethodId: uuid('shipping_method_id').references(
    () => shippingMethods.id
  ),
  note: text('note'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variationId: integer('variation_id').references(() => productVariations.id),
  name: text('name').notNull(),
  sku: text('sku'),
  color: text('color'),
  size: text('size'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
  shippingMethod: one(shippingMethods, {
    fields: [orders.shippingMethodId],
    references: [shippingMethods.id],
  }),
  taxRate: one(taxRates, {
    fields: [orders.taxRateId],
    references: [taxRates.id],
  }),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [orderItems.variationId],
    references: [productVariations.id],
  }),
}))

export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  payment_status: text('payment_status', {
    enum: ['pending', 'approved', 'rejected', 'completed'],
  })
    .notNull()
    .default('pending'),
  refundMethod: text('refund_method', {
    enum: ['original_payment', 'store_credit', 'bank_transfer'],
  }).notNull(),
  refundedBy: uuid('refunded_by').references(() => users.id),
  notes: text('notes'),
  attachments: text('attachments').array(), // URLs to attached files
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  refundTransactionId: text('refund_transaction_id'), // For payment gateway reference
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  refundItems: jsonb('refund_items').$type<
    {
      productId: number
      quantity: number
      amount: number
      reason: string
    }[]
  >(),
  adminNotes: text('admin_notes'),
  refundPolicy: text('refund_policy').notNull().default('standard'),
  refundType: text('refund_type', { enum: ['full', 'partial'] }).notNull(),
  refundFee: integer('refund_fee').default(0), // in cents
  refundCurrency: text('refund_currency').notNull().default('USD'),
  refundStatusHistory: jsonb('refund_status_history').$type<
    {
      status: string
      timestamp: string
      note: string
      updatedBy: string
    }[]
  >(),
  refundDocuments: jsonb('refund_documents').$type<
    {
      type: string
      url: string
      name: string
      uploadedAt: string
    }[]
  >(),
  refundCommunication: jsonb('refund_communication').$type<
    {
      type: string
      content: string
      timestamp: string
      sender: string
    }[]
  >(),
  refundAnalytics: jsonb('refund_analytics').$type<{
    processingTime: number
    customerSatisfaction: number
    refundReasonCategory: string
    refundPattern: string
  }>(),
})

// Add relations
export const refundsRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  refundedByUser: one(users, {
    fields: [refunds.refundedBy],
    references: [users.id],
  }),
}))

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description'),
  type: text('type', { enum: ['percentage', 'fixed'] }).notNull(),
  value: integer('value').notNull(), // For percentage: 0-100, For fixed: amount in cents
  minPurchaseAmount: integer('min_purchase_amount'), // Minimum order amount in cents
  maxDiscountAmount: integer('max_discount_amount'), // Maximum discount amount in cents
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  usageLimit: integer('usage_limit'), // Total number of times coupon can be used
  usageCount: integer('usage_count').default(0), // Number of times coupon has been used
  perCustomerLimit: integer('per_customer_limit'), // Number of times a single customer can use
  isActive: boolean('is_active').default(true),
  isFirstTimeOnly: boolean('is_first_time_only').default(false),
  isNewCustomerOnly: boolean('is_new_customer_only').default(false),
  excludedProducts: jsonb('excluded_products').$type<string[]>(), // Product IDs that can't use this coupon
  excludedCategories: jsonb('excluded_categories').$type<string[]>(), // Category IDs that can't use this coupon
  includedProducts: jsonb('included_products').$type<string[]>(), // Only these products can use this coupon
  includedCategories: jsonb('included_categories').$type<string[]>(), // Only these categories can use this coupon
  customerGroups: jsonb('customer_groups').$type<string[]>(), // Customer groups that can use this coupon
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  analytics: jsonb('analytics').$type<{
    totalDiscountsGiven: number
    totalRevenueImpact: number
    averageOrderValue: number
    redemptionRate: number
    lastUsedAt: string | null
  }>(),
})

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  profileImage: varchar('profile_image', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: varchar('verification_token', { length: 255 }),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

export const shippingMethods = pgTable('shipping_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Add relations for shipping methods
export const shippingMethodsRelations = relations(
  shippingMethods,
  ({ many }) => ({
    orders: many(orders),
  })
)

export const dataModeSettings = pgTable('data_mode_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  mode: text('mode', { enum: ['local', 'remote'] })
    .notNull()
    .default('local'),
  endpoints: jsonb('endpoints').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const apiIntegrations = pgTable('api_integration', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  customerName: text('customer_name').notNull(),
  customerPassword: text('customer_password').notNull(),
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret').notNull(),
  token: text('token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  additionalFields: jsonb('additional_fields')
    .$type<{
      field1: string
      field2: string
      field3: string
      field4: string
      field5: string
    }>()
    .notNull()
    .default({
      field1: '',
      field2: '',
      field3: '',
      field4: '',
      field5: '',
    }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type ApiIntegration = typeof apiIntegrations.$inferSelect
export type NewApiIntegration = typeof apiIntegrations.$inferInsert

export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description'),
  type: text('type').notNull(), // 'fixed' or 'percentage'
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minPurchaseAmount: decimal('min_purchase_amount', {
    precision: 10,
    scale: 2,
  }),
  maxDiscountAmount: decimal('max_discount_amount', {
    precision: 10,
    scale: 2,
  }),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})
