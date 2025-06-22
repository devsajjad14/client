'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi'
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
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your products
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

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Products List */}
      <Card className="p-8 rounded-xl shadow-md bg-white">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Style</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.smallPicture && (
                          <img
                            src={product.smallPicture}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">ID: {product.styleId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{product.style}</td>
                    <td className="py-3 px-4 text-gray-900">{product.brand}</td>
                    <td className="py-3 px-4 text-gray-900">{product.department}</td>
                    <td className="py-3 px-4 text-gray-900">${Number(product.sellingPrice).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-900">{product.quantityAvailable}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {product.onSale === 'Y' && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            On Sale
                          </span>
                        )}
                        {product.isNew === 'Y' && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/catalog/products/edit/${product.styleId.toString()}`)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.styleId)}
                          disabled={deletingId === product.styleId}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 disabled:opacity-50"
                        >
                          {deletingId === product.styleId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <FiTrash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
} 