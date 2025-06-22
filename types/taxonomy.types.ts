// types/taxonomy.types.ts

export interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP?: string
  SUBTYP_1?: string
  SUBTYP_2?: string
  SUBTYP_3?: string
  SORT_POSITION?: string | null
  WEB_URL?: string
  LONG_DESCRIPTION?: string | null
  DLU?: string
  CATEGORY_STYLE?: string | null
  SHORT_DESC?: string
  LONG_DESCRIPTION_2?: string
  ACTIVE?: number
  GOOGLEPRODUCTTAXONOMY?: string
  SITE?: number
  CATEGORYTEMPLATE?: string | null
  BACKGROUNDIMAGE?: string | null
  SHORT_DESC_ON_PAGE?: string | null
  META_TAGS?: string | null
}

export type CategoriesType = Record<string, TaxonomyItem[]>

export interface FiltersList {
  name: string
  from: string
  isPrice?: boolean
}
