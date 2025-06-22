export interface Variation {
  SKU_ID: number
  COLOR: string
  ATTR1_ALIAS: string
  HEX: string
  SIZE: string
  SUBSIZE: string | null
  QUANTITY: number
  COLORIMAGE: string
}

export interface AlternateImage {
  SMALLALTPICTURE: string
  MEDIUMALTPICTURE: string
  LARGEALTPICTURE: string
}

export interface Product {
  ROW_NUMBER: number
  STARTINGROW: number
  ENDINGROW: number
  STYLE_ID: number
  NAME: string
  STYLE: string
  QUANTITY_AVAILABLE: number
  ON_SALE: string
  IS_NEW: string
  SMALLPICTURE: string
  MEDIUMPICTURE: string
  LARGEPICTURE: string
  DEPT: string
  TYP: string
  SUBTYP: string
  BRAND: string
  SELLING_PRICE: number
  REGULAR_PRICE: number
  LONG_DESCRIPTION: string

  OF7: string | null
  OF12: string | null
  OF13: string | null
  OF15: string | null
  FORCE_BUY_QTY_LIMIT: string | null
  LAST_RCVD: string | null
  VARIATIONS: Variation[]
  ALTERNATE_IMAGES: AlternateImage[]
}
