'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
  className?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { src, alt = 'Avatar', fallback, size = 'md', status, className, ...props },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }

    const statusClasses = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      busy: 'bg-red-500',
      away: 'bg-yellow-500',
    }

    const statusSize = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
    }

    return (
      <div className='relative inline-block' ref={ref}>
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-full border border-gray-200 dark:border-gray-700',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              className='object-cover'
              sizes={sizeClasses[size]}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700'>
              {fallback || (
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {alt
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              )}
            </div>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
              statusClasses[status],
              statusSize[size]
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

const AvatarImage = ({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) => (
  <Image
    src={src}
    alt={alt}
    fill
    className={cn('object-cover', className)}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
)

const AvatarFallback = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700',
      className
    )}
  >
    {children}
  </div>
)

export { Avatar, AvatarImage, AvatarFallback }
