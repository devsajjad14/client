// components/header/search.tsx
import { SearchIcon } from 'lucide-react'

export default function Search() {
  return (
    <form action='/search' className='w-full'>
      <div className='relative'>
        <input
          type='search'
          name='q'
          className='w-full h-12 px-4 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
          placeholder='Search...'
          aria-label='Search products'
        />
        <button
          type='submit'
          className='absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-500 hover:text-primary'
          aria-label='Submit search'
        >
          <SearchIcon className='w-5 h-5' />
        </button>
      </div>
    </form>
  )
}
