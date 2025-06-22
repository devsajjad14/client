import * as React from 'react'

export function MiniBannersSkeleton() {
  return (
    <div className='w-full bg-gray-50'>
      {/* Full-width container with equal padding on both sides */}
      <div className='w-full px-0.5'>
        {/* Grid for 3 banners with 2-3px gap */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5'>
          {/* Skeleton for each banner */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='relative group overflow-hidden shadow-md animate-pulse'
            >
              {/* Image Placeholder */}
              <div className='w-full h-[200px] sm:h-[250px] lg:h-[300px] bg-gray-200'></div>

              {/* Overlay Placeholder */}
              <div className='absolute inset-0 bg-gray-300 opacity-20'></div>

              {/* Text Content Placeholder */}
              <div className='absolute inset-0 flex flex-col justify-end items-center p-4 sm:p-6 text-center'>
                {/* Title Placeholder */}
                <div className='h-6 sm:h-8 bg-gray-300 rounded-lg w-3/4 mb-2'></div>
                {/* Description Placeholder */}
                <div className='h-4 bg-gray-300 rounded-lg w-1/2 mb-4'></div>
                {/* Button Placeholder */}
                <div className='h-8 bg-gray-300 rounded-full w-24'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
