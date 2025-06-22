'use server'

import { Redis } from '@upstash/redis'
import { TaxonomyItem } from '@/types/taxonomy.types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_KEY = 'taxonomy-data'
const CACHE_TTL_SECONDS = 3600 * 24 * 7 // 7 days
const API_URL =
  'https://www.alumnihall.com/mobileapi/api.cfc?method=getWebTaxonomy'

let inMemoryCache: TaxonomyItem[] | null = null

const streamResponse = async (res: Response): Promise<string> => {
  const reader = res.body?.getReader()
  if (!reader) throw new Error('Failed to get readable stream')

  const decoder = new TextDecoder()
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }

  return result
}

export const fetchTaxonomyData = async (): Promise<TaxonomyItem[]> => {
  // 1. Use in-memory cache if available
  if (inMemoryCache) return inMemoryCache

  // 2. Redis cache fallback
  try {
    const cached = await redis.get<TaxonomyItem[]>(CACHE_KEY)
    if (cached) {
      inMemoryCache = cached
      return cached
    }
  } catch (err) {
    // Log the error and continue
    console.log('Redis error:', err)
    console.warn('[Redis Cache Miss]')
  }

  // 3. Fetch from API with retry
  const maxRetries = 3
  const timeoutMs = 5000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      const res = await fetch(API_URL, { 
        signal: controller.signal,
        next: { revalidate: 3600 * 24 * 7 }  // 7 days revalidation
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)

      const text = await streamResponse(res)
      const data = JSON.parse(text) as TaxonomyItem[]

      // Store in Redis & in-memory - with silent failure
      try {
        await redis.set(CACHE_KEY, data, { ex: CACHE_TTL_SECONDS })
        inMemoryCache = data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Silently continue on Redis errors
        console.warn('[Redis Write Skip]')
      }

      return data
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 1000))
        continue
      }

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Fetch Timeout]', API_URL)
      } else {
        console.error('[Fetch Error]', error)
      }

      return []
    }
  }

  return []
}

/*   without vercel best solution like on windows server 


'use server'

import { TaxonomyItem } from '@/types/taxonomy.types'
import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'taxonomy.json')
const CACHE_TTL = 3600 * 1000 // 1 hour in milliseconds

// Ensure the cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// Fixed timestamp (e.g., server start time or build time)
const SERVER_START_TIME = Date.now() // Set this once when the server starts

export const fetchTaxonomyData = async (): Promise<TaxonomyItem[]> => {
  // Check if cached data exists and is not expired
  if (fs.existsSync(CACHE_FILE)) {
    const stats = fs.statSync(CACHE_FILE)
    const cacheAge = SERVER_START_TIME - stats.mtimeMs // Calculate cache age

    if (cacheAge < CACHE_TTL) {
      // Return cached data
      const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8')
      return JSON.parse(cachedData)
    }
  }

  const apiUrl =
    'https://www.alumnihall.com/mobileapi/api.cfc?method=getWebTaxonomy'

  const MAX_RETRIES = 3 // Maximum number of retries
  const RETRY_DELAY = 1000 // Delay between retries in milliseconds
  const REQUEST_TIMEOUT = 5000 // 5 seconds timeout

  let retries = 0

  while (retries < MAX_RETRIES) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const res = await fetch(apiUrl, {
        signal: controller.signal,
      })

      clearTimeout(timeout) // Clear timeout on success

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`)
      }

      // Get the readable stream from the response body
      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get readable stream from response')
      }

      const decoder = new TextDecoder('utf-8')
      let result = ''

      // Process the stream in chunks
      while (true) {
        const { done, value } = await reader.read()
        if (done) break // Exit the loop when the stream is complete

        // Decode the chunk and append it to the result
        result += decoder.decode(value, { stream: true })
      }

      // Parse the complete result as JSON
      const data: TaxonomyItem[] = JSON.parse(result)

      // Store the data in the cache
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data), 'utf-8')

      return data
    } catch (error) {
      retries++
      if (retries < MAX_RETRIES) {
        console.warn(
          `Attempt ${retries} failed. Retrying in ${RETRY_DELAY}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      } else {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Request timed out:', apiUrl)
        } else {
          console.error('Error fetching taxonomy:', error)
        }
        return []
      }
    }
  }

  return [] // Fallback in case all retries fail
}

*/
