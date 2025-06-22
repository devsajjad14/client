// products-pagination.tsx
'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductsPaginationProps {
  totalPages: number
  currentPage: number
  isLoading?: boolean
}

const ProductsPagination: React.FC<ProductsPaginationProps> = ({
  totalPages,
  currentPage,
  isLoading = false,
}) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isLoading) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center gap-2'>
          <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
        </div>
      )
    }

    const buttons = []
    const maxButtons = 5
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const end = Math.min(totalPages, start + maxButtons - 1)

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1)
    }

    // First Page button
    if (start > 1) {
      buttons.push(
        <Button
          key='first'
          variant='ghost'
          size='icon'
          onClick={() => handlePageChange(1)}
          disabled={isLoading}
          aria-label='Go to first page'
          className='hidden sm:inline-flex'
        >
          <ChevronsLeft className='h-4 w-4' />
        </Button>
      )
    }

    // Previous button
    buttons.push(
      <Button
        key='prev'
        variant='ghost'
        size='icon'
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        aria-label='Previous page'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>
    )

    // Numbered buttons
    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'ghost'}
          size='icon'
          onClick={() => handlePageChange(i)}
          disabled={isLoading}
          aria-label={`Go to page ${i}`}
          className={i === currentPage ? 'font-bold' : ''}
        >
          {i}
        </Button>
      )
    }

    // Next button
    buttons.push(
      <Button
        key='next'
        variant='ghost'
        size='icon'
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        aria-label='Next page'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    )

    // Last Page button
    if (end < totalPages) {
      buttons.push(
        <Button
          key='last'
          variant='ghost'
          size='icon'
          onClick={() => handlePageChange(totalPages)}
          disabled={isLoading}
          aria-label='Go to last page'
          className='hidden sm:inline-flex'
        >
          <ChevronsRight className='h-4 w-4' />
        </Button>
      )
    }

    return buttons
  }

  return (
    <div className='flex items-center justify-center gap-1 sm:gap-2'>
      {renderPaginationButtons()}
    </div>
  )
}

export default ProductsPagination
