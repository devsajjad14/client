import * as React from 'react'

export function HomeCarouselSkeleton() {
  return (
    <div className='overflow-hidden relative'>
      {/* Carousel Container */}
      <div className='flex'>
        {/* Single Slide Skeleton */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='flex-[0_0_100%] min-w-0 relative'>
            {/* Image Placeholder */}
            <div className='aspect-[16/7] md:aspect-[16/6] relative bg-gray-200 animate-pulse'>
              {/* Overlay Placeholder */}
              <div className='absolute inset-0 flex items-center justify-center text-center'>
                <div className='max-w-2xl space-y-6 px-4'>
                  {/* Title Placeholder */}
                  <div className='h-8 md:h-12 bg-gray-300 rounded-lg w-3/4 mx-auto'></div>
                  {/* Button Placeholder */}
                  <div className='h-12 bg-gray-300 rounded-full w-48 mx-auto'></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons Placeholder */}
      <div className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-3 shadow-lg opacity-0'>
        <div className='h-6 w-6 bg-gray-300 rounded-full'></div>
      </div>
      <div className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-3 shadow-lg opacity-0'>
        <div className='h-6 w-6 bg-gray-300 rounded-full'></div>
      </div>
    </div>
  )
}
