// products-filter.tsx
'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { List, Grid, Loader2 } from 'lucide-react'
import { Input } from '../ui/input'
import ProductsPagination from '@/components/category/products-pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SortOption = (typeof SORT_OPTIONS)[number]['value']
type ViewMode = 'list' | 'grid'
type PerPageOption = (typeof PER_PAGE_OPTIONS)[number]

const SORT_OPTIONS = [
  { value: 'nameAZ', label: 'Name (A-Z)' },
  { value: 'nameZA', label: 'Name (Z-A)' },
  { value: 'priceLowToHigh', label: 'Price (Low to High)' },
  { value: 'priceHighToLow', label: 'Price (High to Low)' },
  { value: 'brand', label: 'Brands' },
] as const

const PER_PAGE_OPTIONS = [1, 2, 3, 4, 8] as const

interface ProductsFilterProps {
  totalPages: number
  currentPage: number
  onViewChange?: (view: ViewMode) => void
  onLoadingChange?: (isLoading: boolean) => void
}

export default function ProductsFilter({
  totalPages,
  currentPage,
  onViewChange,
  onLoadingChange,
}: ProductsFilterProps) {
  const [view, setView] = useState<ViewMode>('grid')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Initialize local search value and view mode from URL
  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '')
    const urlView = searchParams.get('view') as ViewMode | null
    if (urlView && (urlView === 'grid' || urlView === 'list')) {
      setView(urlView)
    }
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      if (resetPage) params.set('page', '1')
      return params.toString()
    },
    [searchParams]
  )

  // Handle loading state changes
  useEffect(() => {
    onLoadingChange?.(isActionLoading)
  }, [isActionLoading, onLoadingChange])

  // Debounced search handler
  const handleSearch = useCallback(
    (value: string) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }

      debounceTimeout.current = setTimeout(() => {
        router.push(`${pathname}?${createQueryString('search', value, true)}`)
      }, 300)
    },
    [pathname, createQueryString, router]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    handleSearch(value)
  }

  const handleActionWithLoader = async (action: () => void) => {
    setIsActionLoading(true)
    try {
      action()
      // Minimum loader display time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      setIsActionLoading(false)
    }
  }

  const handlePerPageChange = (value: string) => {
    handleActionWithLoader(() => {
      const perPage = PER_PAGE_OPTIONS.includes(Number(value) as PerPageOption)
        ? value
        : '8'
      router.push(`${pathname}?${createQueryString('perPage', perPage, true)}`)
    })
  }

  const handleSortByChange = (value: string) => {
    handleActionWithLoader(() => {
      const sortBy = SORT_OPTIONS.some((opt) => opt.value === value)
        ? (value as SortOption)
        : 'nameAZ'
      router.push(`${pathname}?${createQueryString('sortBy', sortBy, false)}`)
    })
  }

  const handleViewChange = (newView: ViewMode) => {
    setView(newView)
    onViewChange?.(newView)
    // Sync view mode to URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Modern Loader (Only shows for actions) */}
      {isActionLoading && (
        <div className='fixed inset-0 z-40 bg-white/50 backdrop-blur-sm flex items-center justify-center'>
          <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
        </div>
      )}

      {/* Controls Section */}
      <div className='flex flex-col md:flex-row items-center justify-between gap-4 w-full'>
        {/* Sort and Show controls */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto'>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <span className='text-sm font-medium text-gray-600 whitespace-nowrap'>
              Sort By:
            </span>
            <Select
              value={searchParams.get('sortBy') || 'nameAZ'}
              onValueChange={handleSortByChange}
              disabled={isActionLoading}
            >
              <SelectTrigger
                className='w-[180px]'
                aria-label='Sort products by' // Added accessible name
              >
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={`sort-${option.value}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <span className='text-sm font-medium text-gray-600 whitespace-nowrap'>
              Show:
            </span>
            <Select
              value={searchParams.get('perPage') || '8'}
              onValueChange={handlePerPageChange}
              disabled={isActionLoading}
            >
              <SelectTrigger
                className='w-[100px]'
                aria-label='Show Per page' // Added accessible name
              >
                <SelectValue placeholder='Per Page' />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={`perpage-${option}`}
                    value={option.toString()}
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination */}
        <div className='w-full md:w-auto'>
          <ProductsPagination
            totalPages={totalPages}
            currentPage={currentPage}
            isLoading={isActionLoading}
          />
        </div>
      </div>

      {/* Search and View Toggle Section */}
      <div className='flex flex-col sm:flex-row items-center gap-4 w-full mb-6'>
        <div className='w-full relative'>
          <Input
            placeholder='Search products or brands...'
            className='w-full pl-10 focus-visible:ring-2 focus-visible:ring-blue-500/70 rounded-lg py-5 shadow-sm transition-all'
            value={localSearch}
            onChange={handleSearchChange}
          />
          <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
            <svg
              className='h-5 w-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>

        <div className='flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl backdrop-blur-sm border border-gray-200/50'>
          <button
            onClick={() => handleViewChange('list')}
            className={`p-2 rounded-lg transition-all ${
              view === 'list'
                ? 'bg-white shadow-md text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label='List view'
            disabled={isActionLoading}
          >
            <List className='w-5 h-5' />
          </button>
          <button
            onClick={() => handleViewChange('grid')}
            className={`p-2 rounded-lg transition-all ${
              view === 'grid'
                ? 'bg-white shadow-md text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label='Grid view'
            disabled={isActionLoading}
          >
            <Grid className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  )
}
