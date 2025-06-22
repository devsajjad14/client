import React from 'react'
import { cn } from '@/lib/utils' // Utility for merging class names

// Sheet Root
interface SheetProps {
  children: React.ReactNode
}

const Sheet = ({ children }: SheetProps) => {
  return <div>{children}</div>
}

// Sheet Trigger
interface SheetTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const SheetTrigger = ({ children, className, onClick }: SheetTriggerProps) => {
  return (
    <button className={cn('cursor-pointer', className)} onClick={onClick}>
      {children}
    </button>
  )
}

// Sheet Content
export interface SheetContentProps {
  children: React.ReactNode
  className?: string
}

const SheetContent = ({ children, className }: SheetContentProps) => {
  return (
    <div className={cn('bg-white p-6 shadow-lg', className)}>{children}</div>
  )
}

// Sheet Header
interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

const SheetHeader = ({ children, className }: SheetHeaderProps) => {
  return <div className={cn('mb-4', className)}>{children}</div>
}

// Sheet Title
interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

const SheetTitle = ({ children, className }: SheetTitleProps) => {
  return <h2 className={cn('text-xl font-bold', className)}>{children}</h2>
}

// Export all components
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle }
