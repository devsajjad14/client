// components/skeletons/product-card-skeleton.tsx
import * as React from 'react'

interface ProductCardSkeletonProps {
  view?: 'list' | 'grid' // Made optional with default
}

export function ProductCardSkeleton({
  view = 'grid', // Default value
}: ProductCardSkeletonProps) {
  return (
    <div
      className={
        view === 'grid'
          ? 'p-0 flex flex-col justify-between overflow-hidden shadow-lg m-2 animate-pulse'
          : 'p-0 flex flex-row justify-between overflow-hidden shadow-lg m-2 animate-pulse'
      }
    >
      {/* Image Skeleton */}
      <div
        className={
          view === 'grid'
            ? 'relative w-full h-64 overflow-hidden p-4 bg-gray-200'
            : 'relative w-32 h-32 overflow-hidden bg-gray-200'
        }
      />

      {/* Content Skeleton */}
      <div
        className={
          view === 'grid' ? 'flex flex-col gap-2 p-6' : 'flex-1 p-4 space-y-2'
        }
      >
        {/* Title Skeleton */}
        <div className='h-6 bg-gray-300 rounded-lg w-3/4' />

        {/* Price Skeleton */}
        <div className='h-6 bg-gray-300 rounded-lg w-1/2' />

        {/* Brand Skeleton */}
        <div className='h-4 bg-gray-300 rounded-lg w-1/3' />
      </div>

      {/* Footer Skeleton */}
      <div
        className={
          view === 'grid'
            ? 'flex justify-center items-center p-6 bg-gray-50 rounded-b-lg'
            : 'p-4'
        }
      >
        <div className='w-full h-10 bg-gray-300 rounded-lg' />
      </div>
    </div>
  )
}
