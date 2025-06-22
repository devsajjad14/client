import { sql } from 'drizzle-orm'
import { settings } from '../schema'

export async function up(db: any) {
  // Create settings table using Drizzle schema
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "settings" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "key" TEXT NOT NULL UNIQUE,
      "value" TEXT,
      "type" TEXT NOT NULL,
      "group" TEXT NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // General settings
  await db.insert(settings).values([
    {
      key: 'siteTitle',
      value: 'My Store',
      type: 'string',
      group: 'general',
    },
    {
      key: 'description',
      value: 'Welcome to my online store',
      type: 'string',
      group: 'general',
    },
    {
      key: 'keywords',
      value: 'store, online, shop',
      type: 'string',
      group: 'general',
    },
  ])

  // Color settings
  await db.insert(settings).values([
    {
      key: 'primaryColor',
      value: '#3B82F6',
      type: 'string',
      group: 'colors',
    },
    {
      key: 'secondaryColor',
      value: '#10B981',
      type: 'string',
      group: 'colors',
    },
    {
      key: 'accentColor',
      value: '#8B5CF6',
      type: 'string',
      group: 'colors',
    },
  ])

  // Store settings
  await db.insert(settings).values([
    {
      key: 'storeName',
      value: 'My Store',
      type: 'string',
      group: 'store',
    },
    {
      key: 'storeEmail',
      value: 'store@example.com',
      type: 'string',
      group: 'store',
    },
    {
      key: 'storePhone',
      value: '+1 (555) 000-0000',
      type: 'string',
      group: 'store',
    },
    {
      key: 'storeAddress',
      value: '123 Store Street, City, Country',
      type: 'string',
      group: 'store',
    },
  ])

  // Branding settings
  await db.insert(settings).values([
    {
      key: 'logo',
      value: '',
      type: 'file',
      group: 'branding',
    },
    {
      key: 'favicon',
      value: '',
      type: 'file',
      group: 'branding',
    },
  ])
}

export async function down(db: any) {
  await db.execute(sql`DROP TABLE IF EXISTS "settings";`)
} 