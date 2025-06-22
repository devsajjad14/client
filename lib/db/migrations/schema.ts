import {
  pgTable,
  foreignKey,
  uuid,
  text,
  boolean,
  timestamp,
  unique,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const addresses = pgTable(
  'addresses',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    type: text().notNull(),
    isDefault: boolean('is_default').default(false),
    street: text().notNull(),
    street2: text('street_2'),
    city: text().notNull(),
    state: text().notNull(),
    postalCode: text('postal_code').notNull(),
    country: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'addresses_user_id_users_id_fk',
    }).onDelete('cascade'),
  ]
)

export const sessions = pgTable(
  'sessions',
  {
    sessionToken: text().primaryKey().notNull(),
    userId: uuid().notNull(),
    expires: timestamp({ mode: 'string' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'sessions_userId_users_id_fk',
    }).onDelete('cascade'),
  ]
)

export const users = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
    email: text().notNull(),
    password: text(),
    emailVerified: timestamp({ mode: 'string' }),
    image: text(),
  },
  (table) => [unique('users_email_unique').on(table.email)]
)

export const categories = pgTable('categories', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  slug: text().notNull(),
  description: text(),
  parentId: text('parent_id'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
})

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid().primaryKey().notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text(),
    avatarUrl: text('avatar_url'),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: 'user_profiles_id_users_id_fk',
    }).onDelete('cascade'),
  ]
)

export const products = pgTable('products', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  price: integer().notNull(),
  categoryId: text('category_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
})

export const productImages = pgTable(
  'product_images',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    url: text().notNull(),
    alt: text(),
    order: integer().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_images_product_id_products_id_fk',
    }).onDelete('cascade'),
  ]
)

export const reviews = pgTable(
  'reviews',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    productId: text('product_id').notNull(),
    rating: integer().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    images: text().array(),
    verifiedPurchase: boolean('verified_purchase').default(false),
    helpfulVotes: integer('helpful_votes').default(0),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'reviews_user_id_users_id_fk',
    }).onDelete('cascade'),
  ]
)

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: 'string' }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
      name: 'verification_tokens_identifier_token_pk',
    }),
  ]
)

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text(),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'accounts_userId_users_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.provider, table.providerAccountId],
      name: 'accounts_provider_providerAccountId_pk',
    }),
  ]
)
