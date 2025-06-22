'use client'

import { useState } from 'react'
import { FiCalendar } from 'react-icons/fi'

export function DateRangePicker() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  return (
    <div className='flex items-center space-x-2'>
      <div className='relative'>
        <input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white'
        />
        <FiCalendar className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
      </div>
      <span className='text-gray-500'>to</span>
      <div className='relative'>
        <input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white'
        />
        <FiCalendar className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
      </div>
    </div>
  )
} 