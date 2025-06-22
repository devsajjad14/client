// app\cart\page.tsx
import { Metadata } from 'next'
import CartDetails from '@/components/cart/cart-details'
import CartSummary from '@/components/cart/cart-summary'
import { Suspense } from 'react'
import CartLoading from '@/components/cart/cart-loading'

export const metadata: Metadata = {
  title: 'Your Cart - My Store',
  description: 'Review your items and proceed to checkout',
}

export default function CartPage() {
  return (
    <div className='bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen'>
      <div className='mx-auto px-4 pb-24 pt-12 sm:px-6 lg:px-8 max-w-7xl'>
        <div className='grid grid-cols-1 gap-x-12 lg:grid-cols-12'>
          <section className='lg:col-span-8'>
            <Suspense fallback={<CartLoading />}>
              <CartDetails />
            </Suspense>
          </section>

          <aside className='sticky top-8 h-fit lg:col-span-4'>
            <CartSummary />
          </aside>
        </div>
      </div>
    </div>
  )
}
