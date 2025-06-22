// components/header/index.tsx
'use client'

import dynamic from 'next/dynamic'
import Logo from './logo'
import CartButton from './cart-button' // Using your original component
import Search from './search'
import { NavBarSkeleton } from '../skeletons/nav-bar-skeleton'
import { Suspense } from 'react'
import { CartPopup } from '../cart/CartPopup'
import { UserButtonSkeleton } from '../skeletons/user-button-skeleton'
import { TaxonomyItem } from '@/types/taxonomy.types'

const UserButton = dynamic(() => import('./user-button'), {
  ssr: false,
  loading: () => <UserButtonSkeleton />,
})

const NavBar = dynamic(() => import('./nav-bar'), {
  ssr: false,
  loading: () => <NavBarSkeleton />,
})

export default function Header({ txData }: { txData: TaxonomyItem[] }) {
  return (
    <>
      <header className='bg-white text-gray-800 shadow-lg border-b border-gray-200  top-0 z-40'>
        {/* Top Section */}
        <div className='container mx-auto px-4 sm:px-6 py-3'>
          {/* First Row: Logo + Actions */}
          <div className='flex items-center justify-between gap-4'>
            <Logo />

            {/* Desktop Search */}
            <div className='hidden md:block flex-1 max-w-xl mx-4'>
              <Search />
            </div>

            {/* User + Cart - Now directly visible on mobile */}
            <div className='flex items-center gap-4'>
              <Suspense fallback={<UserButtonSkeleton />}>
                <UserButton />
              </Suspense>
              <CartButton /> {/* Your original component */}
            </div>
          </div>

          {/* Mobile Search - Second Row */}
          <div className='md:hidden mt-3'>
            <Search />
          </div>
        </div>

        {/* NavBar */}
        <Suspense fallback={<NavBarSkeleton />}>
          <NavBar txData={txData} />
        </Suspense>
      </header>

      <CartPopup />
    </>
  )
}
