import * as React from 'react'

export function NavBarSkeleton() {
  return (
    <nav className='bg-gray-100 shadow-md w-full z-50'>
      <div className='max-w-7xl mx-auto px-1 sm:px-2'>
        <div className='flex justify-between items-center py-2'>
          {/* Desktop Menu Skeleton */}
          <div className='hidden md:flex items-center space-x-2'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className='h-6 bg-gray-200 rounded-lg w-24'
              ></div>
            ))}
          </div>

          {/* Mobile Menu Button Skeleton */}
          <div className='md:hidden h-8 bg-gray-200 rounded-lg w-8'></div>
        </div>
      </div>

      {/* Mobile Menu Skeleton */}
      <div className='md:hidden bg-white shadow-lg px-2 py-3'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='mb-2'>
            <div className='h-6 bg-gray-200 rounded-lg w-3/4'></div>
            <div className='mt-1 space-y-1 pl-3'>
              {Array.from({ length: 2 }).map((_, subIndex) => (
                <div
                  key={subIndex}
                  className='h-4 bg-gray-200 rounded-lg w-1/2'
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
