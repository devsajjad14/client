'use client'

import { FiBell, FiSearch, FiMoon, FiSun } from 'react-icons/fi'
import { UserMenu } from './UserMenu'
import { useTheme } from 'next-themes'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
      <div className='flex items-center justify-between px-6 py-4'>
        {/* Search Bar */}
        <div className='relative w-96'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FiSearch className='text-gray-400' />
          </div>
          <input
            type='text'
            placeholder='Search...'
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        {/* Right Side */}
        <div className='flex items-center space-x-6'>
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            {theme === 'dark' ? (
              <FiSun className='text-yellow-400' />
            ) : (
              <FiMoon className='text-gray-700 dark:text-gray-300' />
            )}
          </button>

          {/* Notifications */}
          <div className='relative'>
            <button className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative'>
              <FiBell />
              <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full'></span>
            </button>
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
