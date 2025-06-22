import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export const metadata: Metadata = {
  title: 'Order Confirmed - My Store',
  description: 'Thank you for your purchase',
}

export default function CheckoutSuccessPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
        <div className='text-center'>
          <div className='flex justify-center'>
            <CheckCircleIcon className='h-16 w-16 text-green-500' />
          </div>
          <h1 className='mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Thank you for your order!
          </h1>
          <p className='mt-4 text-lg text-gray-500'>
            Your order has been confirmed and will be shipped soon.
          </p>
        </div>

        <div className='mt-12 rounded-lg bg-white p-8 shadow-xl ring-1 ring-gray-200/50'>
          <div className='text-center'>
            <h2 className='text-lg font-medium text-gray-900'>
              Order confirmation has been sent to your email
            </h2>
            <p className='mt-2 text-sm text-gray-500'>
              You will receive shipping updates when your order is dispatched.
            </p>
          </div>

          <div className='mt-8 space-y-4'>
            <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
              <dt className='text-sm font-medium text-gray-600'>Order number</dt>
              <dd className='text-sm font-mono text-gray-900'>#ORDER123</dd>
            </div>
            <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
              <dt className='text-sm font-medium text-gray-600'>
                Estimated delivery
              </dt>
              <dd className='text-sm text-gray-900'>3-5 business days</dd>
            </div>
          </div>
        </div>

        <div className='mt-12 flex items-center justify-center gap-4'>
          <Link
            href='/'
            className='rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          >
            Continue Shopping
          </Link>
          <Link
            href='/account'
            className='rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500'
          >
            View Order Status
          </Link>
        </div>
      </div>
    </div>
  )
} 