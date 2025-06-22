import { sql } from 'drizzle-orm'
import { settings } from '../schema'

export async function up(db: any) {
  // Theme settings
  await db.insert(settings).values([
    {
      key: 'mainBanners',
      value: '3',
      type: 'number',
      group: 'theme',
    },
    {
      key: 'miniBanners',
      value: '4',
      type: 'number',
      group: 'theme',
    },
    {
      key: 'featuredProducts',
      value: '8',
      type: 'number',
      group: 'theme',
    },
    {
      key: 'brandLogos',
      value: '6',
      type: 'number',
      group: 'theme',
    },
    {
      key: 'productsPerPage',
      value: '12',
      type: 'number',
      group: 'theme',
    },
    {
      key: 'relatedProducts',
      value: '4',
      type: 'number',
      group: 'theme',
    },
    {
      key: 'showCompanySection',
      value: 'true',
      type: 'boolean',
      group: 'theme',
    },
    {
      key: 'showUpsellProducts',
      value: 'true',
      type: 'boolean',
      group: 'theme',
    },
    {
      key: 'showSocialSharing',
      value: 'true',
      type: 'boolean',
      group: 'theme',
    },
    {
      key: 'showReviews',
      value: 'true',
      type: 'boolean',
      group: 'theme',
    },
    {
      key: 'showStockStatus',
      value: 'true',
      type: 'boolean',
      group: 'theme',
    },
    {
      key: 'defaultViewMode',
      value: 'grid',
      type: 'string',
      group: 'theme',
    },
    {
      key: 'enableFilters',
      value: 'true',
      type: 'boolean',
      group: 'theme',
    },
  ])
}

export async function down(db: any) {
  await db.delete(settings).where(sql`"group" = 'theme'`)
} 