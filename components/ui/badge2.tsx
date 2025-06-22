import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  icon?: React.ReactNode
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          badgeVariants[variant],
          className
        )}
        {...props}
      >
        {icon && <span className='mr-1'>{icon}</span>}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, type BadgeVariant }
