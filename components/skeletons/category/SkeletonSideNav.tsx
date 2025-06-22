// components/skeletons/category/SkeletonSideNav.tsx
import React from 'react'

export default function SkeletonSideNav() {
  return (
    <div className='w-72 min-w-[288px] bg-white shadow-lg rounded-lg p-6 h-fit sticky top-6'>
      {/* Reset Filters Button */}
      <div className='w-full h-10 bg-gray-200 rounded-lg mb-6 animate-pulse'></div>

      {/* Selected Filters Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='h-6 w-40 bg-gray-200 rounded animate-pulse'></div>
          <div className='h-5 w-5 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='mt-4 space-y-2'>
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className='w-full h-12 bg-gray-100 rounded-lg animate-pulse'
            ></div>
          ))}
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='h-6 w-40 bg-gray-200 rounded animate-pulse'></div>
          <div className='h-5 w-5 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='mt-4 space-y-2'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-5 w-full bg-gray-100 rounded animate-pulse'
            ></div>
          ))}
        </div>
      </div>

      {/* Filter Sections */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className='mb-8'>
          <div className='flex items-center justify-between'>
            <div className='h-6 w-40 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-5 w-5 bg-gray-200 rounded animate-pulse'></div>
          </div>
          <div className='mt-4 space-y-2'>
            {[...Array(5)].map((_, j) => (
              <div key={j} className='flex items-center gap-3'>
                <div className='w-5 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='h-5 w-32 bg-gray-200 rounded animate-pulse'></div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Price Range Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div className='h-6 w-40 bg-gray-200 rounded animate-pulse'></div>
          <div className='h-5 w-5 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='mt-4 space-y-2'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <div className='w-5 h-5 bg-gray-200 rounded animate-pulse'></div>
              <div className='h-5 w-32 bg-gray-200 rounded animate-pulse'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
