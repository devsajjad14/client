import * as React from 'react'

export function BrandLogosSkeleton() {
  return (
    <div className='w-full bg-gradient-to-r from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
      {/* Title Skeleton */}
      <div className='h-10 bg-gray-200 rounded-lg w-1/3 mx-auto mb-8'></div>

      {/* Carousel Skeleton */}
      <div className='w-full relative'>
        {/* Carousel Content Skeleton */}
        <div className='flex gap-4 -ml-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className='pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
            >
              {/* Logo Placeholder */}
              <div className='relative aspect-[3/2] bg-gray-200 rounded-lg animate-pulse'></div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons Skeleton */}
        <div className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-md border border-gray-200'>
          <div className='h-6 w-6 bg-gray-300 rounded-full'></div>
        </div>
        <div className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-md border border-gray-200'>
          <div className='h-6 w-6 bg-gray-300 rounded-full'></div>
        </div>
      </div>
    </div>
  )
}
