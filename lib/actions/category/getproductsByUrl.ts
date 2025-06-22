'use server'

import { Product } from '@/types/product-types'
import { FiltersList, TaxonomyItem } from '@/types/taxonomy.types'
import { Redis } from '@upstash/redis'

interface Props {
  currentTaxonomy: TaxonomyItem
  filtersList: FiltersList[]
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Smart search function with fuzzy matching
const smartSearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm) return products

  const normalizedSearch = searchTerm.toLowerCase().trim()
  const searchRegex = new RegExp(
    normalizedSearch
      .split('')
      .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*?'),
    'i'
  )

  return products.filter((product) => {
    const nameMatch = product.NAME?.match(searchRegex)
    const brandMatch = product.BRAND?.match(searchRegex)
    const score = (nameMatch ? 1 : 0) + (brandMatch ? 2 : 0)
    return score > 0
  })
}

// Helper function to ensure a parameter is always an array and decode each item
const ensureArray = (param: string | string[] | undefined): string[] => {
  if (!param) return []

  // Handle comma-separated string
  if (typeof param === 'string') {
    return param.split(',').map((item) => decodeURIComponent(item.trim()))
  }

  // Handle array of strings
  return param.map((item) => (item ? decodeURIComponent(item) : item))
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const CACHE_TTL = 3600 * 24 // 24 hours in seconds

// In-memory cache for faster access
const inMemoryCache: {
  [key: string]: {
    products: Product[]
    timestamp: number
  }
} = {}

export const getProducts = async ({
  currentTaxonomy,
  filtersList,
  searchParams,
}: Props): Promise<{
  products: Product[]
  totalPages: number
  productCount: number
  isLoading: boolean
}> => {
  const perPage = parseInt(searchParams?.perPage as string) || 8
  const page = parseInt(searchParams?.page as string) || 1
  const sortBy = (searchParams?.sortBy as string) || 'nameAZ'
  const searchTerm = (searchParams?.search as string) || ''
  const offset = (page - 1) * perPage

  // Check if we need all products (for filters)
  const isAllProducts = perPage === 1000

  // Create cache key based on taxonomy and search term only
  const cacheKey = `products:${JSON.stringify({
    dept: currentTaxonomy?.DEPT,
    typ: currentTaxonomy?.TYP,
    searchTerm,
  })}`

  try {
    if (!currentTaxonomy) throw new Error('No taxonomy data provided')

    let products: Product[] = []
    let isLoading = true

    // Check in-memory cache first
    if (
      inMemoryCache[cacheKey] &&
      Date.now() - inMemoryCache[cacheKey].timestamp < CACHE_TTL * 1000
    ) {
      console.log('Returning data from in-memory cache')
      products = inMemoryCache[cacheKey].products
      isLoading = false
    } else {
      // Check Redis cache
      const cachedData = await redis.get<Product[]>(cacheKey)
      if (cachedData) {
        console.log('Returning data from Redis cache')
        products = cachedData
        // Update in-memory cache
        inMemoryCache[cacheKey] = {
          products,
          timestamp: Date.now(),
        }
        isLoading = false
      } else {
        // Fetch from API
        const queryParams = new URLSearchParams()
        if (currentTaxonomy.DEPT && currentTaxonomy.DEPT !== 'EMPTY') {
          queryParams.append('dept', currentTaxonomy.DEPT)
        }
        if (currentTaxonomy.TYP && currentTaxonomy.TYP !== 'EMPTY') {
          queryParams.append('typ', currentTaxonomy.TYP)
        }

        const apiURL = `https://www.alumnihall.com/mobileapi/api.cfc?method=getproductsbycategorydetails&${queryParams.toString()}`

        const res = await fetch(apiURL, {
          next: { tags: ['products'] },
          cache: 'no-store',
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
        }

        products = await res.json()

        // Cache the results
        await redis.setex(cacheKey, CACHE_TTL, products)
        inMemoryCache[cacheKey] = {
          products,
          timestamp: Date.now(),
        }
        isLoading = false
      }
    }

    // Ensure we have unique products by STYLE_ID
    products = products.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.STYLE_ID === product.STYLE_ID)
    )

    // Apply smart search
    products = smartSearch(products, searchTerm)

    // For side-nav, return all products without filtering
    if (isAllProducts) {
      return {
        products,
        totalPages: 1,
        productCount: products.length,
        isLoading,
      }
    }

    // Apply filters
    const filteredProducts = products.filter((product) => {
      // Group filters by type
      const filterGroups = filtersList.reduce((acc, filterConfig) => {
        const filterValues = ensureArray(searchParams[filterConfig.name])
        if (filterValues.length > 0) {
          acc[filterConfig.name] = filterValues
        }
        return acc
      }, {} as Record<string, string[]>)

      // If no filters are selected, return all products
      if (Object.keys(filterGroups).length === 0) return true

      // Check if product matches any of the selected filters
      return Object.entries(filterGroups).every(
        ([filterName, filterValues]) => {
          const filterConfig = filtersList.find((f) => f.name === filterName)
          if (!filterConfig) return true

          // Special handling for price range
          if (filterConfig.isPrice) {
            const range = filterValues[0]
            const productPrice = parseFloat(product.SELLING_PRICE.toString())

            switch (range) {
              case 'Under $50':
                return productPrice < 50
              case '$50 - $100':
                return productPrice >= 50 && productPrice <= 100
              case '$100 - $200':
                return productPrice >= 100 && productPrice <= 200
              case 'Over $200':
                return productPrice > 200
              default:
                return true
            }
          }

          // For filters that come from VARIATIONS
          if (filterConfig.from === 'VARIATIONS') {
            if (!product.VARIATIONS || !Array.isArray(product.VARIATIONS))
              return false
            // Check if any of the selected values match any of the product's variations
            return filterValues.some((value) =>
              product.VARIATIONS.some(
                (v) => v[filterName.toUpperCase() as keyof typeof v] === value
              )
            )
          }

          // For direct property filters (like brand)
          const productValue =
            product[filterName.toUpperCase() as keyof Product]?.toString()
          // Check if the product's value matches any of the selected values
          return filterValues.some((value) => value === productValue)
        }
      )
    })

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const compareStrings = (a?: string, b?: string) =>
        !a && !b ? 0 : !a ? 1 : !b ? -1 : a.localeCompare(b)

      const compareNumbers = (a?: number, b?: number) =>
        a === undefined && b === undefined
          ? 0
          : a === undefined
          ? 1
          : b === undefined
          ? -1
          : a - b

      switch (sortBy) {
        case 'nameAZ':
          return compareStrings(a.NAME, b.NAME)
        case 'nameZA':
          return compareStrings(b.NAME, a.NAME)
        case 'priceLowToHigh':
          return compareNumbers(a.REGULAR_PRICE, b.REGULAR_PRICE)
        case 'priceHighToLow':
          return compareNumbers(b.REGULAR_PRICE, a.REGULAR_PRICE)
        case 'brand':
          return compareStrings(a.BRAND, b.BRAND)
        default:
          return 0
      }
    })

    // Calculate pagination
    const totalPages = Math.ceil(sortedProducts.length / perPage)
    const productCount = filteredProducts.length

    // Apply pagination
    const paginatedProducts = sortedProducts.slice(offset, offset + perPage)

    return {
      products: paginatedProducts,
      totalPages,
      productCount,
      isLoading,
    }
  } catch (error) {
    console.error('Error:', error)
    return { products: [], totalPages: 1, productCount: 0, isLoading: false }
  }
}
