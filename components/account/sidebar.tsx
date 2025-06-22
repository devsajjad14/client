'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from '@/components/icons'
import { LogoutButton } from '@/components/auth/logout-button'

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <div className='w-full md:w-64 space-y-6'>
      {/* Profile Header */}
      <div className='flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
          <Icons.user className='h-5 w-5 text-gray-600 dark:text-gray-300' />
        </div>
        <span className='font-medium'>My Account</span>
      </div>

      {/* Navigation */}
      <nav className='space-y-1'>
        {[
          { href: '/account', icon: <Icons.dashboard />, label: 'Overview' },
          { href: '/account/profile', icon: <Icons.user />, label: 'Profile' },
          {
            href: '/account/addresses',
            icon: <Icons.mapPin />,
            label: 'Addresses',
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className='[&>svg]:h-5 [&>svg]:w-5'>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
        <LogoutButton />
      </div>
    </div>
  )
}
