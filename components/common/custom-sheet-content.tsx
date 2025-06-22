import { SheetContent, SheetContentProps } from '@/components/common/sheet'
import React from 'react'

interface CustomSheetContentProps extends SheetContentProps {
  children: React.ReactNode
}

export const CustomSheetContent = ({
  children,
  ...props
}: CustomSheetContentProps) => {
  return <SheetContent {...props}>{children}</SheetContent>
}
