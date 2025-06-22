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
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Show 10 inventory items per page
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
        value: ((product.stockQuantity || 0) * (Number(product.sellingPrice) || 0))
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
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
        department: fullProduct.department || '',
        type: fullProduct.type || '',
        subType: fullProduct.subType || '',
        brand: fullProduct.brand || '',
        sellingPrice: Number(fullProduct.sellingPrice),
        regularPrice: Number(fullProduct.regularPrice),
        longDescription: fullProduct.longDescription || '',
        of7: fullProduct.of7 || '',
        of12: fullProduct.of12 || '',
        of13: fullProduct.of13 || '',
        of15: fullProduct.of15 || '',
        forceBuyQtyLimit: fullProduct.forceBuyQtyLimit || '',
        lastReceived: fullProduct.lastReceived || '',
        tags: fullProduct.tags || '',
        urlHandle: fullProduct.urlHandle || '',
        barcode: fullProduct.barcode || '',
        sku: fullProduct.sku || '',
        trackInventory: fullProduct.trackInventory,
        stockQuantity: editValue,
        lowStockThreshold: product.lowStockThreshold,
        continueSellingOutOfStock: fullProduct.continueSellingOutOfStock,
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
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50/20 to-white">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-blue-400 animate-pulse"></div>
                </div>
                <span className="text-sm font-medium text-gray-600">Loading inventory data...</span>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Product Details
                    </div>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      Stock Level
                    </div>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      Status
                    </div>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      Trend
                    </div>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      Value
                    </div>
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                      Last Updated
                    </div>
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {currentItems.map((item, index) => (
                  <tr key={item.styleId} className={`hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/60 transition-all duration-200 group relative ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                  }`}>
                    <td className="px-6 py-4 border-r border-gray-100/60">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900 text-sm group-hover:text-blue-700 transition-colors duration-200 leading-tight">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {item.sku}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-blue-50 px-2 py-1 rounded-md border border-blue-200/50">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100/60">
                      {editingId === item.styleId ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(parseInt(e.target.value))}
                              className="h-8 w-28 px-2 text-sm border border-gray-300 bg-white rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-100 shadow-sm transition-all duration-200"
                            />
                            <button
                              onClick={() => handleSaveEdit(item.styleId)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-all duration-200 shadow-sm"
                            >
                              <FiCheck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 shadow-sm"
                            >
                              <FiX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Input
                            placeholder="Reason for change..."
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            className="h-7 w-full px-2 text-xs border border-gray-300 bg-white rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-100 shadow-sm transition-all duration-200"
                          />
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group/stock"
                          onClick={() => handleStartEdit(item)}
                        >
                          <div className="relative">
                            <div className="text-sm font-semibold text-gray-900 group-hover/stock:text-blue-700 transition-all duration-200 flex items-center gap-2">
                              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-md shadow-sm text-xs font-medium">
                                {item.currentStock.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">units</span>
                              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                                Edit
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Low stock at <span className="text-orange-600 font-medium">{item.lowStockThreshold}</span> units
                            </div>
                            <div className="absolute -left-1.5 -top-1.5 h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover/stock:opacity-100 transition-all duration-200 flex items-center justify-center shadow-md">
                              <FiEdit2 className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100/60">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shadow-sm border
                        ${item.status === 'in_stock' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                          : item.status === 'low_stock'
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          item.status === 'in_stock' ? 'bg-green-500' :
                          item.status === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100/60">
                      <div className="flex items-center justify-center">
                        {item.trend === 'up' ? (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 shadow-sm">
                            <FiTrendingUp className="h-3 w-3" />
                            <span className="text-xs font-medium">Up</span>
                          </div>
                        ) : item.trend === 'down' ? (
                          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 shadow-sm">
                            <FiTrendingDown className="h-3 w-3" />
                            <span className="text-xs font-medium">Down</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                            <div className="h-3 w-3 text-center text-xs">—</div>
                            <span className="text-xs font-medium">Stable</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100/60">
                      <div className="text-sm font-semibold text-gray-900 bg-gradient-to-r from-emerald-50 to-green-50 px-2.5 py-1.5 rounded-md border border-emerald-200 shadow-sm">
                        ${item.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${item.currentStock > 0 ? (item.value / item.currentStock).toFixed(2) : '0.00'} per unit
                      </div>
                    </td>
                    <td className="px-5 py-4 border-r border-gray-100/60">
                      <div className="text-xs font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.lastUpdated).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-md transition-all duration-200 border border-gray-600 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        <FiEdit2 className="h-3 w-3 mr-1" />
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

      {/* Pagination */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInventory.length)} of {filteredInventory.length} inventory items
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <FiChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <FiChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <FiChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <FiChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

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