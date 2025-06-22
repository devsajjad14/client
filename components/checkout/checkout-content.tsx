'use client'

import CheckoutForm from '@/components/checkout/checkout-form'
import CheckoutSummary from '@/components/checkout/checkout-summary'
import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import NotLoginCheckoutForm from './not-login-checkout-form'

export default function CheckoutContent() {
  const { data: session } = useSession()

  const { items } = useCartStore()
  const router = useRouter()

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Premium accent bar */}
      <div className='h-1 bg-gradient-to-r from-indigo-600 to-purple-600 w-full'></div>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
        {/* Modern header */}
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>
              Checkout
            </span>
          </h1>
          <div className='text-sm text-gray-500'></div>
        </div>

        {/* Tightened layout */}
        <div className='flex flex-col lg:flex-row gap-0 lg:gap-4'>
          {/* Checkout Form - 68% width */}
          {session?.user ?
          <div className='w-full lg:w-[68%]'>
            <div className='bg-white rounded-xl border border-gray-200'>
              <CheckoutForm />
            </div>
          </div>
:
<div className='w-full lg:w-[68%]'>
            <div className='bg-white rounded-xl border border-gray-200'>
              <NotLoginCheckoutForm />
            </div>
          </div>

}      
          <div className='w-full lg:w-[32%] lg:sticky lg:top-4 lg:self-start'>
            <div className='bg-white rounded-xl border border-gray-200 lg:border-l-0'>
              <CheckoutSummary />
            </div>
          </div>




        </div>

        {/* Trust badges - Modern inline style */}
        <div className='mt-6 flex justify-center space-x-8'>
          <div className='flex items-center text-xs font-medium text-gray-600'>
            <svg
              className='h-4 w-4 text-green-500 mr-1.5'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
            Secure Checkout
          </div>
          <div className='flex items-center text-xs font-medium text-gray-600'>
            <svg
              className='h-4 w-4 text-blue-500 mr-1.5'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M3 17a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 17z'
                clipRule='evenodd'
              />
            </svg>
            PCI Compliant
          </div>
          <div className='flex items-center text-xs font-medium text-gray-600'>
            <svg
              className='h-4 w-4 text-purple-500 mr-1.5'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z'
                clipRule='evenodd'
              />
            </svg>
            24/7 Support
          </div>
        </div>
      </div>
    </div>
  )
} 