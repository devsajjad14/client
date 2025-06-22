'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { FiArrowLeft, FiLoader, FiPlus, FiTrash2, FiDollarSign, FiCreditCard, FiFileText } from 'react-icons/fi'

type Order = {
  id: string
  totalAmount: number
  customerName: string
  customerEmail: string
  status: string
}

type RefundItem = {
  productId: number
  quantity: number
  amount: number
  reason: string
}

type Refund = {
  id: string
  amount: number
  refundType: string
  orderId: string
}

export default function AddRefundPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string>('')
  const [refundItems, setRefundItems] = useState<RefundItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [totalRefunded, setTotalRefunded] = useState(0)
  const [formData, setFormData] = useState({
    reason: '',
    refundMethod: 'original_payment',
    refundType: 'full',
    notes: '',
    refundPolicy: 'standard',
  })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true)
      const response = await fetch('/api/orders?status=!full_refunded')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      console.log('Orders API Response:', data)
      if (!data.orders || !Array.isArray(data.orders)) {
        console.error('Invalid orders data:', data)
        toast.error('Received invalid orders data from server')
        return
      }
      setOrders(data.orders)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const loadRefundsForOrder = async (orderId: string) => {
    try {
      setIsLoadingOrderDetails(true)
      const response = await fetch('/api/refunds')
      if (!response.ok) throw new Error('Failed to fetch refunds')
      const refunds: Refund[] = await response.json()
      
      // Calculate total refunded amount for this order - no cents conversion
      const orderRefunds = refunds.filter(refund => refund.orderId === orderId)
      const total = orderRefunds.reduce((sum, refund) => sum + refund.amount, 0)
      setTotalRefunded(total)
    } catch (error) {
      console.error('Error loading refunds:', error)
      toast.error('Failed to load refund history')
    } finally {
      setIsLoadingOrderDetails(false)
    }
  }

  const handleOrderSelect = async (orderId: string) => {
    setSelectedOrder(orderId)
    const order = orders.find(o => o.id === orderId)
    if (order) {
      await loadRefundsForOrder(orderId)
      const orderTotal = order.totalAmount
      const isPartiallyRefunded = order.status === 'partial_refunded'
      const remainingAmount = orderTotal - totalRefunded
      
      // If order is partially refunded, force partial refund type
      if (isPartiallyRefunded) {
        setFormData(prev => ({ ...prev, refundType: 'partial' }))
      }

      // Add a default refund item
      setRefundItems([{
        productId: 0,
        quantity: 1,
        amount: formData.refundType === 'full' && !isPartiallyRefunded ? remainingAmount : 0,
        reason: 'Customer request'
      }])
    }
  }

  const handleRefundTypeChange = (value: string) => {
    const order = orders.find(o => o.id === selectedOrder)
    if (!order) return

    const isPartiallyRefunded = order.status === 'partial_refunded'
    const orderTotal = order.totalAmount
    const remainingAmount = orderTotal - totalRefunded
    
    // Prevent full refund if order is partially refunded
    if (isPartiallyRefunded && value === 'full') {
      toast.error('Cannot select full refund for partially refunded order')
      return
    }

    setFormData({ ...formData, refundType: value })
    setRefundItems([{
      productId: 0,
      quantity: 1,
      amount: value === 'full' && !isPartiallyRefunded ? remainingAmount : 0,
      reason: 'Customer request'
    }])
  }

  const handleAddItem = () => {
    setRefundItems([
      ...refundItems,
      {
        productId: 0,
        quantity: 1,
        amount: 0,
        reason: ''
      }
    ])
  }

  const handleRemoveItem = (index: number) => {
    setRefundItems(refundItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof RefundItem, value: any) => {
    const newItems = [...refundItems]
    const order = orders.find(o => o.id === selectedOrder)
    
    if (field === 'amount' && order) {
      const orderTotal = order.totalAmount
      const isPartiallyRefunded = order.status === 'partial_refunded'
      const remainingAmount = orderTotal - totalRefunded
      
      if (formData.refundType === 'full' && !isPartiallyRefunded) {
        // For full refund, force the exact remaining amount
        value = remainingAmount
      } else {
        // For partial refund, ensure amount is less than remaining amount
        value = Math.min(value, remainingAmount - 0.01) // Subtract 0.01 to ensure it's strictly less
      }
    }
    
    newItems[index] = { ...newItems[index], [field]: value }
    setRefundItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) {
      toast.error('Please select an order')
      return
    }

    const order = orders.find(o => o.id === selectedOrder)
    if (!order) {
      toast.error('Order not found')
      return
    }

    const orderTotal = parseFloat(order.totalAmount.toString())
    const refundTotal = parseFloat(refundItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toFixed(2))

    // Validate refund amount based on type
    if (formData.refundType === 'full' && Math.abs(refundTotal - orderTotal) > 0.01) {
      toast.error(`Full refund amount must be ${orderTotal.toFixed(2)}`)
      return
    }

    if (formData.refundType === 'partial' && refundTotal >= orderTotal) {
      toast.error('Partial refund amount must be less than the order total')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder,
          amount: refundTotal, // Use actual amount, no cents conversion
          reason: formData.reason,
          refundMethod: formData.refundMethod,
          refundType: formData.refundType,
          notes: formData.notes,
          refundPolicy: formData.refundPolicy,
          refundItems: refundItems.map(item => ({
            ...item,
            amount: parseFloat(item.amount.toString()) // Use actual amount, no cents conversion
          })),
          payment_status: 'pending',
          refundStatusHistory: [{
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Refund created',
            updatedBy: 'system'
          }]
        }),
      })

      if (!response.ok) throw new Error('Failed to create refund')

      toast.success('Refund created successfully')
      router.push('/admin/sales/refunds')
    } catch (error) {
      console.error('Error creating refund:', error)
      toast.error('Failed to create refund')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Create Refund
            </h1>
            <p className="text-muted-foreground mt-2">
              Process a new refund for an existing order
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/sales/refunds')}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Refunds
            </Button>
            <Button 
              type="submit"
              form="refund-form"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 h-11 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Refund'
              )}
            </Button>
          </div>
        </div>

        <form id="refund-form" onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-8 shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-6">
                <FiCreditCard className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Order Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="order" className="text-sm font-medium">Select Order</Label>
                  <Select
                    value={selectedOrder}
                    onValueChange={handleOrderSelect}
                    disabled={isLoadingOrders}
                  >
                    <SelectTrigger className="h-11">
                      {isLoadingOrders ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Loading orders...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select an order" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>Order #{order.id}</span>
                            <span className="text-gray-500">${order.totalAmount}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundType" className="text-sm font-medium">Refund Type</Label>
                  <Select
                    value={formData.refundType}
                    onValueChange={handleRefundTypeChange}
                    disabled={isLoadingOrderDetails || orders.find(o => o.id === selectedOrder)?.status === 'partial_refunded'}
                  >
                    <SelectTrigger className="h-11">
                      {isLoadingOrderDetails ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select refund type" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Refund</SelectItem>
                      <SelectItem value="partial">Partial Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  {orders.find(o => o.id === selectedOrder)?.status === 'partial_refunded' && (
                    <p className="text-xs text-amber-600 mt-1">
                      This order has been partially refunded. Only partial refunds are allowed.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundMethod" className="text-sm font-medium">Refund Method</Label>
                  <Select
                    value={formData.refundMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, refundMethod: value })
                    }
                    disabled={isLoadingOrderDetails}
                  >
                    <SelectTrigger className="h-11">
                      {isLoadingOrderDetails ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select refund method" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original_payment">Original Payment Method</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-6">
                <FiFileText className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Refund Details</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium">Reason for Refund</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Enter reason for refund"
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Enter any additional notes"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiDollarSign className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Refund Items</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={formData.refundType === 'full'}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {selectedOrder && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {isLoadingOrderDetails ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <FiLoader className="h-4 w-4 animate-spin" />
                      <span>Loading order details...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {formData.refundType === 'full' 
                          ? `Full refund amount: $${((orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - totalRefunded).toFixed(2)}`
                          : `Maximum refundable amount: $${((orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - totalRefunded - 0.01).toFixed(2)}`
                        }
                      </p>
                      {totalRefunded > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Total refunded so far: ${totalRefunded.toFixed(2)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {refundItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Amount ($)</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(index, 'amount', parseFloat(e.target.value))
                        }
                        required
                        className="h-11"
                        max={formData.refundType === 'partial' 
                          ? (orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - totalRefunded - 0.01
                          : (orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - totalRefunded}
                        step="0.01"
                        min="0"
                        readOnly={formData.refundType === 'full' && orders.find(o => o.id === selectedOrder)?.status !== 'partial_refunded'}
                      />
                      {formData.refundType === 'partial' && (
                        <p className="text-xs text-gray-500">
                          Max: ${((orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - totalRefunded - 0.01).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value))
                        }
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Reason</Label>
                      <Input
                        value={item.reason}
                        onChange={(e) =>
                          handleItemChange(index, 'reason', e.target.value)
                        }
                        required
                        className="h-11"
                      />
                    </div>
                    {formData.refundType === 'partial' && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
} 