'use server'

import { Product } from '@/types/product-types'

interface FetchProductParams {
  id: number
}

export const getProductById = async ({
  id,
}: FetchProductParams): Promise<{ product: Product | null }> => {
  try {
    // Validate ID first
    if (!id || isNaN(id)) {
      console.error('Invalid product ID:', id)
      return { product: null }
    }

    const apiURL = `https://www.alumnihall.com/mobileapi/api.cfc?method=getproductbystyleid&style_id=${id}`
    console.log('Fetching from URL:', apiURL)

    const res = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(
        `Failed to fetch product ${id}: ${res.status} ${res.statusText}`,
        'Response:', await res.text()
      )
      return { product: null }
    }

    const data = await res.json()
    console.log('API Response data:', data)

    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      return { product: data[0] }
    }

    // Handle single object response
    if (data && typeof data === 'object') {
      return { product: data }
    }

    console.log('Unexpected API response format for ID:', id)
    return { product: null }
  } catch (error) {
    console.error(
      `Error fetching product ${id}:`,
      error instanceof Error ? error.message : error,
      'Full error:', error
    )
    return { product: null }
  }
}
