'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItemProps = {
  href: string
  icon?: React.ReactNode
  label: string
  isOpen: boolean
  nested?: boolean
}

export function NavItem({
  href,
  icon,
  label,
  isOpen,
  nested = false,
}: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        flex items-center px-4 py-2.5 rounded-lg transition-all duration-200
        ${
          nested
            ? 'text-sm pl-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            : 'text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${
          isActive
            ? nested
              ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20'
              : 'bg-gray-100 dark:bg-gray-700'
            : ''
        }
      `}
    >
      {icon && (
        <span
          className={`
          ${
            nested
              ? isActive
                ? 'text-primary-500 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500'
              : 'text-gray-500 dark:text-gray-400'
          }
        `}
        >
          {icon}
        </span>
      )}
      {isOpen && (
        <span
          className={`
          ml-3
          ${nested ? (isActive ? 'font-medium' : 'font-normal') : 'font-medium'}
        `}
        >
          {label}
        </span>
      )}
    </Link>
  )
}
