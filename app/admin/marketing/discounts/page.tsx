'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { FiSearch, FiDollarSign, FiCalendar, FiLoader } from 'react-icons/fi'

type Discount = {
  id: string
  orderId: string
  discountType: string
  discountValue: number
  createdAt: string
  order: {
    totalAmount: number
    customerName: string | null
    customerEmail: string | null
  }
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDiscounts()
  }, [])

  const loadDiscounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      
      // Filter orders with discounts and transform data
      const discountsData = data.orders
        .filter((order: any) => order.discount > 0)
        .map((order: any) => ({
          id: order.id,
          orderId: order.id,
          discountType: 'fixed', // Default to fixed since we don't store type
          discountValue: Number(order.discount), // Ensure it's a number
          createdAt: order.createdAt,
          order: {
            totalAmount: Number(order.totalAmount), // Ensure it's a number
            customerName: order.userId ? 'Registered Customer' : 'Guest',
            customerEmail: order.guestEmail || 'N/A'
          }
        }))
      
      setDiscounts(discountsData)
    } catch (error) {
      console.error('Error loading discounts:', error)
      toast.error('Failed to load discounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredDiscounts = discounts.filter(discount => 
    (discount.order.customerEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (discount.order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    discount.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Order Discounts
            </h1>
            <p className="text-muted-foreground mt-2">
              View discounts applied to orders
            </p>
          </div>
        </div>

        <Card className="p-6 shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Discount Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Order Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <FiLoader className="h-5 w-5 animate-spin text-blue-600" />
                        <span>Loading discounts</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No discounts found
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => (
                    <tr key={discount.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <span className="font-medium">#{discount.orderId}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{discount.order.customerName}</div>
                          <div className="text-sm text-gray-500">{discount.order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <FiDollarSign className="mr-1" />
                          {Number(discount.discountValue).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FiDollarSign className="mr-1" />
                          {Number(discount.order.totalAmount).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-500">
                          <FiCalendar className="mr-1" />
                          {new Date(discount.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
