import React from 'react'

export default function FooterSkeleton() {
  return (
    <footer className='bg-gray-900 text-white py-10 shadow-xl'>
      <div className='container mx-auto px-6'>
        {/* Top Section Skeleton */}
        <div className='flex flex-col md:flex-row justify-between items-center gap-8 animate-pulse'>
          {/* Logo Skeleton */}
          <div className='flex items-center space-x-4'>
            <div className='w-24 h-24 bg-gray-800 rounded-lg'></div>
          </div>

          {/* Newsletter Form Skeleton */}
          <div className='w-full md:w-1/2 bg-gray-800 p-5 rounded-2xl shadow-lg space-y-3'>
            <div className='h-6 w-1/2 bg-gray-700 rounded'></div>
            <div className='h-4 w-3/4 bg-gray-700 rounded'></div>
            <div className='flex items-center bg-gray-700 rounded-lg overflow-hidden shadow-md'>
              <div className='w-full px-4 py-2 bg-gray-600 h-10'></div>
              <div className='px-6 py-2 bg-gray-600 h-10 w-24'></div>
            </div>
          </div>
        </div>

        {/* Links Section Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-gray-300'>
          {/* Customer Service */}
          <div>
            <div className='h-6 w-1/3 bg-gray-800 rounded mb-3'></div>
            <ul className='space-y-2'>
              {[1, 2, 3].map((item) => (
                <li key={item} className='h-4 w-2/3 bg-gray-800 rounded'></li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <div className='h-6 w-1/3 bg-gray-800 rounded mb-3'></div>
            <ul className='space-y-2'>
              {[1, 2].map((item) => (
                <li key={item} className='h-4 w-2/3 bg-gray-800 rounded'></li>
              ))}
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <div className='h-6 w-1/3 bg-gray-800 rounded mb-3'></div>
            <ul className='space-y-2'>
              {[1, 2].map((item) => (
                <li key={item} className='h-4 w-2/3 bg-gray-800 rounded'></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Skeleton */}
        <div className='text-center text-sm text-gray-400 mt-10 border-t border-gray-700 pt-6'>
          <div className='h-4 w-1/4 mx-auto bg-gray-800 rounded'></div>
        </div>
      </div>
    </footer>
  )
}
