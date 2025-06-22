'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiArrowLeft, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi'
import { getProducts, updateProduct } from '@/lib/actions/products'
import { toast } from 'sonner'

interface StockAdjustment {
  styleId: number
  sku: string
  name: string
  currentStock: number
  adjustment: number
  reason: string
  type: 'add' | 'remove' | 'set'
}

export default function AdjustStockPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = (product: any) => {
    if (!adjustments.find(a => a.styleId === product.styleId)) {
      setAdjustments(prev => [...prev, {
        styleId: product.styleId,
        sku: product.sku || '',
        name: product.name,
        currentStock: product.stockQuantity || 0,
        adjustment: 0,
        reason: selectedReason === 'custom' ? customReason : selectedReason,
        type: 'add'
      }])
    }
  }

  const handleAdjustmentChange = (styleId: number, value: number, type: 'add' | 'remove' | 'set') => {
    setAdjustments(prev => prev.map(adj => {
      if (adj.styleId === styleId) {
        // If switching to 'set' type, use current stock as initial value
        const newValue = type === 'set' ? adj.currentStock : value
        return { ...adj, adjustment: newValue, type }
      }
      return adj
    }))
  }

  const handleRemoveAdjustment = (styleId: number) => {
    setAdjustments(prev => prev.filter(adj => adj.styleId !== styleId))
  }

  const handleReasonChange = (value: string) => {
    setSelectedReason(value)
    if (value !== 'custom') {
      setAdjustments(prev => prev.map(adj => ({ ...adj, reason: value })))
    }
  }

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value)
    setAdjustments(prev => prev.map(adj => ({ ...adj, reason: value })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adjustments.length === 0) {
      toast.error('No adjustments to save')
      return
    }

    if (!selectedReason && !customReason) {
      toast.error('Please select or enter a reason for the adjustment')
      return
    }

    try {
      setIsSaving(true)
      
      // Process each adjustment
      for (const adjustment of adjustments) {
        let newStockQuantity = adjustment.currentStock
        
        switch (adjustment.type) {
          case 'add':
            newStockQuantity += adjustment.adjustment
            break
          case 'remove':
            newStockQuantity -= adjustment.adjustment
            break
          case 'set':
            newStockQuantity = adjustment.adjustment
            break
        }

        if (newStockQuantity < 0) {
          toast.error(`Cannot set negative stock for ${adjustment.name}`)
          continue
        }

        const product = products.find(p => p.styleId === adjustment.styleId)
        if (!product) {
          toast.error(`Product ${adjustment.name} not found`)
          continue
        }

        const response = await updateProduct(adjustment.styleId.toString(), {
          ...product,
          stockQuantity: newStockQuantity
        })

        if (!response.success) {
          toast.error(`Failed to update stock for ${adjustment.name}: ${response.error}`)
        }
      }

      toast.success('Stock adjustments saved successfully')
      setAdjustments([])
      setSelectedReason('')
      setCustomReason('')
      await loadProducts() // Reload products to get updated stock levels
    } catch (error) {
      console.error('Error saving adjustments:', error)
      toast.error('Failed to save stock adjustments')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (adjustments.length > 0) {
      if (window.confirm('Are you sure you want to discard all changes? This cannot be undone.')) {
        setAdjustments([])
        setSelectedReason('')
        setCustomReason('')
        setSearchQuery('')
      }
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Adjust Stock</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update product inventory levels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm"
            className="text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
            onClick={handleDiscard}
            disabled={adjustments.length === 0}
          >
            Discard
          </Button>
          <Button 
            size="sm"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleSubmit}
            disabled={isSaving || adjustments.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Product Selection */}
        <div className="col-span-4 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadProducts}
                  disabled={isLoading}
                >
                  <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map(product => (
                    <div
                      key={product.styleId}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku || 'No SKU'}</div>
                      <div className="text-sm text-gray-500">
                        Current Stock: {product.stockQuantity || 0}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Adjustments */}
        <div className="col-span-8 space-y-6">
          {/* Adjustment Reason */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Adjustment Reason</h3>
              <div className="space-y-4">
                <select
                  value={selectedReason}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className="w-full h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a reason</option>
                  <option value="received">Stock Received</option>
                  <option value="damaged">Damaged Stock</option>
                  <option value="returned">Customer Return</option>
                  <option value="count">Stock Count Adjustment</option>
                  <option value="custom">Custom Reason</option>
                </select>
                {selectedReason === 'custom' && (
                  <Textarea
                    value={customReason}
                    onChange={(e) => handleCustomReasonChange(e.target.value)}
                    placeholder="Enter custom reason..."
                    className="min-h-[100px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Adjustments List */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Stock Adjustments</h3>
              {adjustments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Select products from the left to adjust their stock levels
                </div>
              ) : (
                <div className="space-y-4">
                  {adjustments.map(adjustment => (
                    <div key={adjustment.styleId} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-gray-900">{adjustment.name}</div>
                          <div className="text-sm text-gray-500">{adjustment.sku}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdjustment(adjustment.styleId)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Stock
                          </label>
                          <div className="text-sm text-gray-900">{adjustment.currentStock}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adjustment Type
                          </label>
                          <select
                            value={adjustment.type}
                            onChange={(e) => handleAdjustmentChange(adjustment.styleId, adjustment.adjustment, e.target.value as 'add' | 'remove' | 'set')}
                            className="w-full h-9 px-3 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="add">Add Stock (+)</option>
                            <option value="remove">Remove Stock (-)</option>
                            <option value="set">Set Stock (=)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {adjustment.type === 'set' ? 'New Stock Level' : 'Amount to Adjust'}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={adjustment.adjustment}
                            onChange={(e) => handleAdjustmentChange(adjustment.styleId, parseInt(e.target.value), adjustment.type)}
                            className="h-9 px-3 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <span className="font-medium">New Stock Level: </span>
                        <span className={`
                          ${adjustment.type === 'add' ? 'text-green-600' : 
                            adjustment.type === 'remove' ? 'text-red-600' : 
                            'text-blue-600'}
                        `}>
                          {adjustment.type === 'add' ? adjustment.currentStock + adjustment.adjustment :
                           adjustment.type === 'remove' ? adjustment.currentStock - adjustment.adjustment :
                           adjustment.adjustment}
                        </span>
                        {adjustment.type === 'add' && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({adjustment.currentStock} + {adjustment.adjustment})
                          </span>
                        )}
                        {adjustment.type === 'remove' && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({adjustment.currentStock} - {adjustment.adjustment})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 