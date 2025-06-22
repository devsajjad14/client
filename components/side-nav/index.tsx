// /components/side-nav/index2.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import ColorSwatch from './ColorSwatch'
import {
  FilterState,
  initializeFilterState,
  fetchInitialTaxonomy,
  initializeFiltersFromURL,
  generateFilterData,
  getShopByCategoryData,
  priceRanges,
  showColorAsCheckboxes,
} from '@/lib/controllers/helper/category/shop-by-filters'
import { Product } from '@/types/product-types'
import { FiltersList } from '@/types/taxonomy.types'

type SideNavProps = {
  web_url: string
  products: Product[]
  filtersList: FiltersList[]
  onLoadingChange?: (isLoading: boolean) => void
}

export default function SideNav({
  web_url,
  products,
  filtersList,
  onLoadingChange,
}: SideNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<FilterState>(
    initializeFilterState(filtersList)
  )

  const {
    allTaxonomy,
    isActionLoading,
    openSections,
    isCategoryOpen,
    selectedFilters,
  } = state

  // Data initialization
  useEffect(() => {
    const loadData = async () => {
      const allTx = await fetchInitialTaxonomy()
      setState((prev) => ({ ...prev, allTaxonomy: allTx }))
    }
    loadData()
  }, [])

  // URL params initialization
  useEffect(() => {
    const newSelectedFilters = initializeFiltersFromURL(
      searchParams,
      filtersList
    )
    const newOpenSections = Object.fromEntries(
      Object.entries(newSelectedFilters).map(([key, values]) => [
        key,
        values.length > 0,
      ])
    )

    setState((prev) => ({
      ...prev,
      selectedFilters: newSelectedFilters,
      openSections: {
        ...prev.openSections,
        ...newOpenSections,
        selectedFilters: Object.values(newSelectedFilters).some(
          (values) => values.length > 0
        ),
      },
    }))
  }, [searchParams, filtersList])

  // Loading state effect
  useEffect(() => {
    onLoadingChange?.(isActionLoading)
  }, [isActionLoading, onLoadingChange])

  const handleActionWithLoader = useCallback(async (action: () => void) => {
    setState((prev) => ({ ...prev, isActionLoading: true }))
    try {
      action()
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      setState((prev) => ({ ...prev, isActionLoading: false }))
    }
  }, [])

  const updateURL = useCallback(
    (key: string, values: string[]) => {
      handleActionWithLoader(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        if (values.length > 0) {
          newSearchParams.set(key, values.join(','))
        } else {
          newSearchParams.delete(key)
        }
        newSearchParams.delete('page')
        router.replace(`?${newSearchParams.toString()}`, { scroll: false })
      })
    },
    [handleActionWithLoader, router, searchParams]
  )

  const handleFilterChange = useCallback(
    (filterName: string, value: string) => {
      const updatedFilters = selectedFilters[filterName].includes(value)
        ? selectedFilters[filterName].filter((v) => v !== value)
        : [...selectedFilters[filterName], value]

      setState((prev) => ({
        ...prev,
        selectedFilters: {
          ...prev.selectedFilters,
          [filterName]: updatedFilters,
        },
        openSections: {
          ...prev.openSections,
          [filterName]: true,
          selectedFilters: true,
        },
      }))

      updateURL(filterName, updatedFilters)
    },
    [selectedFilters, updateURL]
  )

  const removeFilter = useCallback(
    (filterName: string, value: string) => {
      const updatedFilters = selectedFilters[filterName].filter(
        (v) => v !== value
      )

      setState((prev) => ({
        ...prev,
        selectedFilters: {
          ...prev.selectedFilters,
          [filterName]: updatedFilters,
        },
        openSections: {
          ...prev.openSections,
          [filterName]: updatedFilters.length > 0,
          selectedFilters: Object.entries(selectedFilters).some(
            ([key, values]) => key !== filterName && values.length > 0
          ),
        },
      }))

      updateURL(filterName, updatedFilters)
    },
    [selectedFilters, updateURL]
  )

  const resetFilters = useCallback(() => {
    handleActionWithLoader(() => {
      const resetFiltersState = filtersList.reduce(
        (acc, { name }) => ({ ...acc, [name]: [] }),
        { 'price-range': [] }
      )
      setState((prev) => ({
        ...prev,
        selectedFilters: resetFiltersState,
        openSections: {},
      }))
      router.replace(web_url, { scroll: false })
    })
  }, [filtersList, handleActionWithLoader, router, web_url])

  const toggleSection = useCallback((sectionName: string) => {
    setState((prev) => ({
      ...prev,
      openSections: {
        ...prev.openSections,
        [sectionName]: !prev.openSections[sectionName],
      },
    }))
  }, [])

  const toggleCategory = useCallback(() => {
    setState((prev) => ({ ...prev, isCategoryOpen: !prev.isCategoryOpen }))
  }, [])

  const renderFilterOptions = useCallback(
    (filterName: string, data: string[]) => {
      if (filterName === 'color' && !showColorAsCheckboxes) {
        return data.map((color, hex) => (
          <ColorSwatch
            key={color}
            color={color}
            hex={String(hex)}
            isChecked={selectedFilters[filterName].includes(color)}
            onChange={() => handleFilterChange(filterName, color)}
          />
        ))
      }

      return data.map((value) => (
        <div
          key={value}
          className={`flex items-center gap-3 cursor-pointer ${
            isActionLoading ? 'opacity-50' : ''
          }`}
          onClick={() =>
            !isActionLoading && handleFilterChange(filterName, value)
          }
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selectedFilters[filterName].includes(value)
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300 bg-white'
            }`}
          >
            {selectedFilters[filterName].includes(value) && (
              <Check className='w-3 h-3 text-white' />
            )}
          </div>
          <span className='text-gray-600 hover:text-blue-600'>{value}</span>
        </div>
      ))
    },
    [handleFilterChange, isActionLoading, selectedFilters]
  )

  const shopByCategoryData = getShopByCategoryData(web_url, allTaxonomy)

  return (
    <div className='w-72 bg-white shadow-lg rounded-lg p-6 h-fit sticky top-6'>
      {isActionLoading && (
        <div className='fixed inset-0 z-40 bg-white/50 backdrop-blur-sm flex items-center justify-center'>
          <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
        </div>
      )}

      <button
        onClick={resetFilters}
        disabled={isActionLoading}
        className={`w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-4 py-2 rounded-lg mb-6 ${
          isActionLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isActionLoading ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <RefreshCw className='w-4 h-4' />
        )}
        Reset Filters
      </button>

      <div className='mb-8'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => !isActionLoading && toggleSection('selectedFilters')}
        >
          <h2 className='text-lg font-semibold text-gray-800'>
            Selected Filters
          </h2>
          {openSections.selectedFilters ? (
            <ChevronUp className='w-5 h-5 text-gray-600' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-600' />
          )}
        </div>
        {openSections.selectedFilters && (
          <div className='mt-4 space-y-2'>
            {Object.entries(selectedFilters).flatMap(([filterName, values]) =>
              values.map((value) => (
                <div
                  key={`${filterName}-${value}`}
                  className='w-full bg-gray-50 px-4 py-3 rounded-lg flex items-center justify-between border border-gray-200'
                >
                  <span className='text-sm text-gray-700'>
                    {filterName}: {value}
                  </span>
                  <X
                    className={`w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500 ${
                      isActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() =>
                      !isActionLoading && removeFilter(filterName, value)
                    }
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {shopByCategoryData.length > 0 && (
        <div className='mb-8'>
          <div
            className='flex items-center justify-between cursor-pointer'
            onClick={() => !isActionLoading && toggleCategory()}
          >
            <h2 className='text-lg font-semibold text-gray-800'>
              Shop by Category
            </h2>
            {isCategoryOpen ? (
              <ChevronUp className='w-5 h-5 text-gray-600' />
            ) : (
              <ChevronDown className='w-5 h-5 text-gray-600' />
            )}
          </div>
          {isCategoryOpen && (
            <ul className='space-y-2 mt-4'>
              {shopByCategoryData.map((tax) => {
                const displayName = [
                  tax.SUBTYP_3,
                  tax.SUBTYP_2,
                  tax.SUBTYP_1,
                  tax.TYP,
                  tax.DEPT,
                ].find((val) => val && val !== 'EMPTY')

                return displayName ? (
                  <li
                    key={tax.WEB_TAXONOMY_ID}
                    className='flex items-center gap-3'
                  >
                    <Link
                      href={`/category/${tax.WEB_URL}`}
                      className={`flex items-center gap-3 ${
                        isActionLoading ? 'pointer-events-none opacity-50' : ''
                      }`}
                    >
                      <span className='text-gray-600 hover:text-blue-600'>
                        {displayName}
                      </span>
                    </Link>
                  </li>
                ) : null
              })}
            </ul>
          )}
        </div>
      )}

      {filtersList.map(({ name, from }) => {
        const filterData = generateFilterData(products, name, from)
        if (filterData.length === 0) return null

        return (
          <div key={name} className='mb-8'>
            <div
              className='flex items-center justify-between cursor-pointer'
              onClick={() => !isActionLoading && toggleSection(name)}
            >
              <h2 className='text-lg font-semibold text-gray-800'>
                Shop by {name.charAt(0).toUpperCase() + name.slice(1)}
              </h2>
              {openSections[name] ? (
                <ChevronUp className='w-5 h-5 text-gray-600' />
              ) : (
                <ChevronDown className='w-5 h-5 text-gray-600' />
              )}
            </div>
            {openSections[name] && (
              <div
                className={`mt-4 ${
                  name === 'color' && !showColorAsCheckboxes
                    ? 'flex flex-wrap gap-2'
                    : 'space-y-2'
                }`}
              >
                {renderFilterOptions(name, filterData)}
              </div>
            )}
          </div>
        )
      })}

      <div className='mb-8'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => !isActionLoading && toggleSection('price-range')}
        >
          <h2 className='text-lg font-semibold text-gray-800'>Shop by Price</h2>
          {openSections['price-range'] ? (
            <ChevronUp className='w-5 h-5 text-gray-600' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-600' />
          )}
        </div>
        {openSections['price-range'] && (
          <ul className='space-y-2 mt-4'>
            {renderFilterOptions('price-range', [...priceRanges])}
          </ul>
        )}
      </div>
    </div>
  )
}
