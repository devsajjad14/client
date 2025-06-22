import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import CartProgress from './cart-progress'

export default function CartHeader() {
  return (
    <div className='bg-white shadow-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <Link
            href='/products'
            className='flex items-center text-sm font-medium text-gray-500 hover:text-gray-700'
          >
            <ChevronLeftIcon className='mr-1 h-5 w-5 flex-shrink-0' />
            Continue Shopping
          </Link>

          <div className='hidden sm:block'>
            <CartProgress step={1} />
          </div>

          <div className='ml-4 flow-root sm:ml-6'>
            <Link
              href='/account'
              className='text-sm font-medium text-gray-500 hover:text-gray-700'
            >
              Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
