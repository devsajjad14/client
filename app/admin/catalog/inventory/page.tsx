'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiBarChart2,
  FiCheck,
  FiX,
  FiEdit2,
  FiChevronUp,
  FiLoader,
} from 'react-icons/fi'
import { getProducts, updateProduct, getProduct } from '@/lib/actions/products'
import { toast } from 'sonner'

interface InventoryItem {
  id: number
  styleId: number
  sku: string
  name: string
  category: string
  currentStock: number
  lowStockThreshold: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  value: number
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [editReason, setEditReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState({
    stockStatus: 'all',
    category: 'all',
    trend: 'all',
    valueRange: 'all'
  })

  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setIsLoading(true)
      const products = await getProducts()
      
      const inventoryItems = products.map(product => ({
        id: product.id,
        styleId: product.styleId,
        sku: product.sku || '',
        name: product.name,
        category: product.department || 'Uncategorized',
        currentStock: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        status: getStockStatus(product.stockQuantity || 0, product.lowStockThreshold || 10),
        lastUpdated: product.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        trend: 'stable' as const, // This would need to be calculated based on historical data
        value: (product.stockQuantity || 0) * (product.sellingPrice || 0)
      }))

      setInventory(inventoryItems)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStockStatus = (currentStock: number, lowStockThreshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (currentStock === 0) return 'out_of_stock'
    if (currentStock <= lowStockThreshold) return 'low_stock'
    return 'in_stock'
  }

  // Calculate inventory metrics
  const totalItems = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0)
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length
  const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length

  const filteredInventory = inventory.filter(item => {
    // Search filter
    const searchMatch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Stock status filter
    const stockStatusMatch = 
      filters.stockStatus === 'all' ||
      (filters.stockStatus === 'zero' && item.currentStock === 0) ||
      (filters.stockStatus === 'low' && item.status === 'low_stock') ||
      (filters.stockStatus === 'high' && item.status === 'in_stock')

    // Category filter
    const categoryMatch = 
      filters.category === 'all' ||
      item.category === filters.category

    // Trend filter
    const trendMatch = 
      filters.trend === 'all' ||
      item.trend === filters.trend

    // Value range filter
    const valueMatch = 
      filters.valueRange === 'all' ||
      (filters.valueRange === 'low' && item.value < 1000) ||
      (filters.valueRange === 'medium' && item.value >= 1000 && item.value < 5000) ||
      (filters.valueRange === 'high' && item.value >= 5000)

    return searchMatch && stockStatusMatch && categoryMatch && trendMatch && valueMatch
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(inventory.map(item => item.category)))

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.styleId)
    setEditValue(item.currentStock)
    setEditReason('')
  }

  const handleSaveEdit = async (styleId: number) => {
    if (editValue < 0) {
      toast.error('Stock cannot be negative')
      return
    }

    try {
      setIsSaving(true)
      const product = inventory.find(item => item.styleId === styleId)
      if (!product) {
        toast.error('Product not found')
        return
      }

      // Get the full product data first
      const fullProduct = await getProduct(styleId.toString())
      if (!fullProduct) {
        toast.error('Failed to get product data')
        return
      }

      // Create update object with required fields
      const updateData = {
        styleId: fullProduct.styleId,
        name: fullProduct.name,
        style: fullProduct.style,
        quantityAvailable: fullProduct.quantityAvailable,
        onSale: fullProduct.onSale,
        isNew: fullProduct.isNew,
        smallPicture: fullProduct.smallPicture || '',
        mediumPicture: fullProduct.mediumPicture || '',
        largePicture: fullProduct.largePicture || '',
        department: fullProduct.department,
        type: fullProduct.type,
        subType: fullProduct.subType,
        brand: fullProduct.brand,
        sellingPrice: fullProduct.sellingPrice,
        regularPrice: fullProduct.regularPrice,
        longDescription: fullProduct.longDescription,
        tags: fullProduct.tags,
        urlHandle: fullProduct.urlHandle,
        barcode: fullProduct.barcode,
        sku: fullProduct.sku,
        stockQuantity: editValue,
        lowStockThreshold: product.lowStockThreshold,
        variations: fullProduct.variations,
        alternateImages: fullProduct.alternateImages
      }

      const response = await updateProduct(styleId.toString(), updateData)

      if (response.success) {
        toast.success('Stock updated successfully')
        await loadInventory() // Reload inventory data
      } else {
        toast.error(response.error || 'Failed to update stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock')
    } finally {
      setIsSaving(false)
      setEditingId(null)
      setEditValue(0)
      setEditReason('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
    setEditReason('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your product inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
            onClick={() => loadInventory()}
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => window.location.href = '/admin/catalog/inventory/adjust'}
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FiPackage className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalValue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FiBarChart2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockItems}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <FiAlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockItems}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by SKU, name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-3 text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 rounded-lg flex items-center gap-2"
            >
              <FiFilter className="h-4 w-4" />
              Filters
              {showFilters ? (
                <FiChevronUp className="h-4 w-4" />
              ) : (
                <FiChevronDown className="h-4 w-4" />
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                <div className="space-y-4">
                  {/* Stock Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Status
                    </label>
                    <select
                      value={filters.stockStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">All Stock Levels</option>
                      <option value="zero">Zero Stock</option>
                      <option value="low">Low Stock</option>
                      <option value="high">High Stock</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Trend Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Trend
                    </label>
                    <select
                      value={filters.trend}
                      onChange={(e) => setFilters(prev => ({ ...prev, trend: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">All Trends</option>
                      <option value="up">Trending Up</option>
                      <option value="down">Trending Down</option>
                      <option value="stable">Stable</option>
                    </select>
                  </div>

                  {/* Value Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value Range
                    </label>
                    <select
                      value={filters.valueRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, valueRange: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">All Values</option>
                      <option value="low">Under $1,000</option>
                      <option value="medium">$1,000 - $5,000</option>
                      <option value="high">Over $5,000</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    onClick={() => setFilters({
                      stockStatus: 'all',
                      category: 'all',
                      trend: 'all',
                      valueRange: 'all'
                    })}
                    className="w-full px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Inventory List */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.styleId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                        <div className="text-xs text-gray-400">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.styleId ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(parseInt(e.target.value))}
                              className="h-9 w-32 px-3 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <button
                              onClick={() => handleSaveEdit(item.styleId)}
                              className="h-9 w-9 p-0 text-green-600 hover:text-green-700"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                          <Input
                            placeholder="Reason for change..."
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            className="h-9 w-full px-3 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => handleStartEdit(item)}
                        >
                          <div className="relative">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                              {item.currentStock} units
                              <span className="text-xs text-gray-400 group-hover:text-blue-400">
                                (Click to edit)
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Low stock at {item.lowStockThreshold} units
                            </div>
                            <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <FiEdit2 className="h-3 w-3 text-blue-600" />
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${item.status === 'in_stock' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'low_stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.trend === 'up' ? (
                          <FiTrendingUp className="h-4 w-4 text-green-500" />
                        ) : item.trend === 'down' ? (
                          <FiTrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4 text-gray-400">—</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <FiEdit2 className="h-4 w-4 mr-1.5" />
                        Edit Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Edit Stock Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Stock Level</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <div className="text-sm text-gray-900">
                    {inventory.find(item => item.styleId === editingId)?.currentStock} units
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Stock Level
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(parseInt(e.target.value))}
                    className="h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change
                  </label>
                  <Input
                    placeholder="Enter reason for stock adjustment..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(editingId)}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 