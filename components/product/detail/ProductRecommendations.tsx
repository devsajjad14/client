'use client'

import { useCallback, useEffect, useState } from 'react'
import { getRecommendedProducts } from '@/lib/actions/product/getRecommendedProducts'
import ProductSlider from '../product-slider'
import { Product } from '@/types/product-types'

type FetchState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  retries: number
}

export function ProductRecommendations({ dept }: { dept: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [state, setState] = useState<FetchState>({
    status: 'idle',
    error: null,
    retries: 0,
  })

  const fetchRecommendedProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading' }))

    try {
      const recommendedProducts = await getRecommendedProducts(8, dept)

      if (recommendedProducts.length === 0) {
        throw new Error('No products available')
      }

      setProducts(recommendedProducts)
      setState({ status: 'success', error: null, retries: 0 })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch products'
      console.error('Fetch error:', errorMessage)

      setState((prev) => ({
        status: 'error',
        error: errorMessage,
        retries: prev.retries + 1,
      }))
    }
  }, [dept])

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (state.status !== 'error' || state.retries > 3) return

    const retryDelay = Math.min(1000 * 2 ** state.retries, 10000) // Max 10s
    const timer = setTimeout(fetchRecommendedProducts, retryDelay)

    return () => clearTimeout(timer)
  }, [state.status, state.retries, fetchRecommendedProducts])

  // Initial fetch
  useEffect(() => {
    fetchRecommendedProducts()
  }, [fetchRecommendedProducts])

  if (state.status === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-8'>
        <div className='flex space-x-2'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='h-2 w-2 animate-pulse rounded-full bg-gray-300'
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className='text-sm text-gray-500'>
          {state.retries > 0 ? 'Retrying...' : 'Loading recommendations...'}
        </p>
      </div>
    )
  }

  if (products.length === 0 && state.status === 'success') {
    return (
      <div className='py-8 text-center'>
        <p className='text-gray-500'>No recommendations found in {dept}</p>
      </div>
    )
  }

  return <ProductSlider title={`Recommended in ${dept}`} products={products} />
}
