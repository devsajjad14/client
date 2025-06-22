'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ProductLoading() {
  return (
    <div className='bg-gradient-to-b from-gray-50 to-white min-h-screen'>
      <section className='container mx-auto px-4 py-4'>
        {/* Breadcrumbs Skeleton */}
        <div className='flex items-center gap-2 mb-6'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-4 w-24' />
        </div>

        <div className='flex flex-col lg:flex-row gap-10'>
          {/* Product Gallery Skeleton */}
          <div className='lg:w-1/2'>
            <Skeleton className='aspect-square w-full rounded-2xl mb-5' />
            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='aspect-square w-20 rounded-lg' />
              ))}
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className='lg:w-1/2'>
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
              {/* Header Info Skeleton */}
              <div className='mb-5'>
                <Skeleton className='h-4 w-24 mb-2' />
                <Skeleton className='h-8 w-3/4 mb-2' />
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-20' />
                </div>
              </div>

              {/* Price Skeleton */}
              <div className='my-6'>
                <Skeleton className='h-8 w-32' />
              </div>

              {/* Color Options Skeleton */}
              <div className='mb-6'>
                <Skeleton className='h-4 w-24 mb-3' />
                <div className='flex gap-2'>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className='h-10 w-10 rounded-full' />
                  ))}
                </div>
              </div>

              {/* Size Options Skeleton */}
              <div className='mb-6'>
                <Skeleton className='h-4 w-24 mb-3' />
                <div className='flex gap-2'>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className='h-10 w-16 rounded' />
                  ))}
                </div>
              </div>

              {/* Quantity and Cart Skeleton */}
              <div className='mb-6'>
                <Skeleton className='h-12 w-full rounded' />
              </div>

              {/* Shipping Info Skeleton */}
              <div className='mb-6'>
                <Skeleton className='h-24 w-full rounded' />
              </div>

              {/* Description Skeleton */}
              <div>
                <Skeleton className='h-4 w-32 mb-3' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-5/6' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 