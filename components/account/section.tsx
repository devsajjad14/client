// components/account/section.tsx
export function AccountSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-800 overflow-hidden'>
      <div className='px-6 py-5 border-b border-gray-100 dark:border-gray-800'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {title}
        </h2>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>{description}</p>
      </div>
      <div className='p-6'>{children}</div>
    </div>
  )
}

// components/account/card.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AccountCard({
  title,
  description,
  icon,
  href,
  disabled = false,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  disabled?: boolean
}) {
  return (
    <Link
      href={disabled ? '#' : href}
      className={cn(
        'border rounded-lg p-6 hover:border-primary transition-colors',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className='flex items-center gap-4'>
        <div className='bg-primary-100 p-3 rounded-full text-primary-600'>
          {icon}
        </div>
        <div>
          <h3 className='font-medium'>{title}</h3>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
      </div>
    </Link>
  )
}
