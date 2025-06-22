'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { FiX, FiInfo, FiTag, FiClock, FiLink, FiFileText } from 'react-icons/fi'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
  LONG_DESCRIPTION?: string | null
  SHORT_DESC?: string | null
  META_TAGS?: string | null
  SORT_POSITION?: string | null
  CATEGORY_STYLE?: string | null
  DLU?: string
}

interface CategoryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: number | null
}

export function CategoryDetailsModal({
  isOpen,
  onClose,
  categoryId,
}: CategoryDetailsModalProps) {
  const [category, setCategory] = useState<TaxonomyItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && categoryId) {
      setLoading(true)
      setError(null)
      fetch(`/api/admin/catalog/categories/${categoryId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch category details')
          return res.json()
        })
        .then((data) => {
          setCategory(data)
        })
        .catch((err) => {
          console.error('Error fetching category:', err)
          setError('Failed to load category details')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, categoryId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">Category Details</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                View detailed information about this category
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-[80px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm">
                <FiInfo className="h-4 w-4" />
                {error}
              </div>
            </div>
          ) : category ? (
            <div className="space-y-4">
              {/* Header Section */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <FiTag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{category.DEPT}</h2>
                  <p className="text-xs text-gray-500">
                    {category.TYP !== 'EMPTY' ? category.TYP : 'Main Category'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      category.ACTIVE === 1
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {category.ACTIVE === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-900 mb-2">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Category ID</label>
                        <p className="text-sm">{category.WEB_TAXONOMY_ID}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Department</label>
                        <p className="text-sm">{category.DEPT}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Type</label>
                        <p className="text-sm">{category.TYP === 'EMPTY' ? '-' : category.TYP}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-900 mb-2">Subtypes</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Subtype 1</label>
                        <p className="text-sm">{category.SUBTYP_1 === 'EMPTY' ? '-' : category.SUBTYP_1}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Subtype 2</label>
                        <p className="text-sm">{category.SUBTYP_2 === 'EMPTY' ? '-' : category.SUBTYP_2}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Subtype 3</label>
                        <p className="text-sm">{category.SUBTYP_3 === 'EMPTY' ? '-' : category.SUBTYP_3}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1.5">
                      <FiLink className="h-3.5 w-3.5" />
                      URL Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Web URL</label>
                        <p className="text-sm break-all">{category.WEB_URL}</p>
                      </div>
                      {category.SORT_POSITION && (
                        <div>
                          <label className="text-xs text-gray-500">Sort Position</label>
                          <p className="text-sm">{category.SORT_POSITION}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {category.SHORT_DESC && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1.5">
                        <FiFileText className="h-3.5 w-3.5" />
                        Descriptions
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">Short Description</label>
                          <p className="text-sm">{category.SHORT_DESC}</p>
                        </div>
                        {category.LONG_DESCRIPTION && (
                          <div>
                            <label className="text-xs text-gray-500">Long Description</label>
                            <p className="text-sm">{category.LONG_DESCRIPTION}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {category.META_TAGS && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-xs font-medium text-gray-900 mb-2">Meta Information</h3>
                      <div>
                        <label className="text-xs text-gray-500">Meta Tags</label>
                        <p className="text-sm">{category.META_TAGS}</p>
                      </div>
                    </div>
                  )}

                  {category.DLU && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1.5">
                        <FiClock className="h-3.5 w-3.5" />
                        Last Updated
                      </h3>
                      <p className="text-sm">
                        {new Date(category.DLU).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
} 