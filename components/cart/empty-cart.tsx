import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function EmptyCart() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <ShoppingBagIcon className='h-16 w-16 text-gray-400' />
      <h3 className='mt-4 text-lg font-medium text-gray-900'>
        Your cart is empty
      </h3>
      <p className='mt-1 text-gray-500'>Start adding some items to your cart</p>
      <div className='mt-6'>
        <Link
          href='/products'
          className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
