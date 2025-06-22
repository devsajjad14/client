import * as React from 'react'

export function CompanyIntroSkeleton() {
  return (
    <section className='bg-gradient-to-r from-blue-50 to-gray-100 py-16'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row items-center gap-8 lg:gap-12'>
          {/* Image Section - Exact same dimensions as real component */}
          <div className='w-full lg:w-1/2'>
            <div className='relative overflow-hidden rounded-lg shadow-xl w-full aspect-[4/3] bg-gray-200 mx-auto'>
              {/* Gradient placeholder that matches image dimensions */}
              <div className='absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse'></div>
            </div>
          </div>

          {/* Text Section - Exact same spacing and proportions */}
          <div className='w-full lg:w-1/2 space-y-6'>
            {/* Heading - Matches h1 dimensions */}
            <div className='h-12 w-3/4 bg-gray-300 rounded-full mx-auto lg:mx-0 animate-pulse'></div>

            {/* Paragraphs - Matches text block dimensions */}
            <div className='space-y-4'>
              <div className='h-4 bg-gray-200 rounded-full w-full'></div>
              <div className='h-4 bg-gray-200 rounded-full w-5/6'></div>
              <div className='h-4 bg-gray-200 rounded-full w-4/5'></div>
            </div>

            <div className='space-y-4 pt-2'>
              <div className='h-4 bg-gray-200 rounded-full w-full'></div>
              <div className='h-4 bg-gray-200 rounded-full w-5/6'></div>
              <div className='h-4 bg-gray-200 rounded-full w-3/4'></div>
            </div>

            {/* Link - Matches link dimensions */}
            <div className='pt-2'>
              <div className='h-4 bg-gray-300 rounded-full w-1/2'></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
