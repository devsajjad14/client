import { sql } from 'drizzle-orm'
import { 
  integer, 
  text, 
  timestamp, 
  pgTable, 
  serial 
} from 'drizzle-orm/pg-core'

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