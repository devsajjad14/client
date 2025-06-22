'use server'
import { Product, Variation, AlternateImage } from '@/types/product-types'

export const getRecommendedProducts = async (
  limit: number,
  dept: string
): Promise<Product[]> => {
  const API_URL = `https://www.alumnihall.com/mobileapi/api.cfc?method=getproductsbycategorydetails&dept=${dept}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

  try {
    const response = await fetch(API_URL, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    clearTimeout(timeout) // Clear timeout on success

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error('Invalid API response format')
    }

    return data.slice(0, limit).map((product) => ({
      ROW_NUMBER: Number(product.ROW_NUMBER ?? 0),
      STARTINGROW: Number(product.STARTINGROW ?? 0),
      ENDINGROW: Number(product.ENDINGROW ?? 0),
      STYLE_ID: Number(product.STYLE_ID ?? 0),
      NAME: String(product.NAME ?? 'Unknown Product'),
      STYLE: String(product.STYLE ?? ''),
      QUANTITY_AVAILABLE: Number(product.QUANTITY_AVAILABLE ?? 0),
      ON_SALE: String(product.ON_SALE ?? 'N'),
      IS_NEW: String(product.IS_NEW ?? 'N'),
      SMALLPICTURE: String(product.SMALLPICTURE ?? ''),
      MEDIUMPICTURE: String(product.MEDIUMPICTURE ?? ''),
      LARGEPICTURE: String(product.LARGEPICTURE ?? ''),
      DEPT: String(product.DEPT ?? ''),
      TYP: String(product.TYP ?? ''),
      SUBTYP: String(product.SUBTYP ?? ''),
      BRAND: String(product.BRAND ?? ''),
      OF7: String(product.OF7 ?? ''),
      OF12: String(product.OF12 ?? ''),
      OF13: String(product.OF13 ?? ''),
      OF15: String(product.OF15 ?? ''),

      FORCE_BUY_QTY_LIMIT: String(product.FORCE_BUY_QTY_LIMIT ?? ''),
      LAST_RCVD: String(product.LAST_RCVD ?? ''),

      SELLING_PRICE: Number(product.SELLING_PRICE ?? 0),
      REGULAR_PRICE: Number(product.REGULAR_PRICE ?? 0),
      LONG_DESCRIPTION: String(product.LONG_DESCRIPTION ?? ''),
      VARIATIONS: Array.isArray(product.VARIATIONS)
        ? (product.VARIATIONS as Variation[])
        : [],
      ALTERNATE_IMAGES: Array.isArray(product.ALTERNATE_IMAGES)
        ? (product.ALTERNATE_IMAGES as AlternateImage[])
        : [],
    }))
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out:', API_URL)
    } else {
      console.error('Error fetching featured products:', error)
    }
    return []
  }
}
