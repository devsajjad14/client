'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight, FiMoreVertical } from 'react-icons/fi'
import { getProducts, deleteProduct } from '@/lib/actions/products'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  styleId: number
  name: string
  style: string
  quantityAvailable: number
  onSale: string
  isNew: string
  smallPicture: string | null
  mediumPicture: string | null
  largePicture: string | null
  department: string | null
  type: string | null
  subType: string | null
  brand: string | null
  sellingPrice: string
  regularPrice: string
  longDescription: string | null
  of7: string | null
  of12: string | null
  of13: string | null
  of15: string | null
  forceBuyQtyLimit: string | null
  lastReceived: string | null
  createdAt: Date | null
  updatedAt: Date | null
  variations: {
    id: number
    productId: number
    skuId: number
    color: string
    attr1Alias: string
    hex: string | null
    size: string
    subSize: string | null
    quantity: number
    colorImage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }[]
  alternateImages: {
    id: number
    productId: number
    AltImage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Can be made dynamic later
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      const sortedData = data.sort((a, b) => {
        // Prioritize "New" products
        if (a.isNew === 'Y' && b.isNew !== 'Y') return -1
        if (a.isNew !== 'Y' && b.isNew === 'Y') return 1
        
        // Then sort by creation date (latest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0

        return dateB - dateA
      })
      setProducts(sortedData)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (styleId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setDeletingId(styleId)
        const response = await deleteProduct(styleId.toString())
        if (response.success) {
          setProducts(products.filter(product => product.styleId !== styleId))
        } else {
          alert(response.error || 'Failed to delete product')
        }
      } catch (error) {
        alert('An error occurred while deleting the product')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getStockStatus = (quantity: number) => {
    if (quantity > 10) return { text: 'In Stock', color: 'bg-green-100 text-green-800' }
    if (quantity > 0) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10">
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredProducts.length} total products
            </p>
          </div>
        </div>
        <Button 
          size="sm"
          className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => router.push('/admin/catalog/products/add')}
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 rounded-xl shadow-sm bg-white">
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, style, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-base border-gray-200 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading products...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          currentItems.map((product) => {
            const stockStatus = getStockStatus(product.quantityAvailable)
            return (
              <Card key={product.id} className="p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {product.smallPicture ? (
                      <img
                        src={product.smallPicture}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <span>No Img</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2">
                      <p className="font-bold text-gray-900 text-base">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.brand} • {product.style}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Price</p>
                      <p className="font-medium text-gray-800">${Number(product.sellingPrice).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Stock</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.onSale === 'Y' && (
                          <span className="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full">
                            Sale
                          </span>
                        )}
                        {product.isNew === 'Y' && (
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/catalog/products/edit/${product.styleId.toString()}`)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.styleId)}
                        disabled={deletingId === product.styleId}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === product.styleId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <FiTrash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
        
        <Pagination 
          totalPages={totalPages}
          currentPage={currentPage}
          paginate={paginate}
        />
      </div>
    </div>
  )
}

const Pagination = ({ totalPages, currentPage, paginate }: { totalPages: number, currentPage: number, paginate: (page: number) => void }) => {
  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pageNumbers
  }

  const pages = getPageNumbers()

  return (
    <div className="flex justify-center items-center mt-8">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">First</span>
          <FiChevronsLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Previous</span>
          <FiChevronLeft className="h-5 w-5" />
        </button>
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => paginate(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          )
        )}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Next</span>
          <FiChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Last</span>
          <FiChevronsRight className="h-5 w-5" />
        </button>
      </nav>
    </div>
  )
} 