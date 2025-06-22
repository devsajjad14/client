'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { FiShoppingCart, FiDollarSign } from 'react-icons/fi'

interface TopCustomer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  averageOrderValue: number
}

export function TopCustomers() {
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<TopCustomer[]>([])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const timeRange = searchParams.get('timeRange') || '30d'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let url = `/api/reports/customer-insights?timeRange=${timeRange}`
        if (startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch customers')
        
        const data = await response.json()
        setCustomers(data.topCustomers)
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }

    fetchCustomers()
  }, [searchParams])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiShoppingCart className="mr-1 h-4 w-4" />
                    {customer.totalOrders} orders
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiDollarSign className="mr-1 h-4 w-4" />
                    {formatCurrency(customer.totalSpent)} spent
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(customer.averageOrderValue)}
                </p>
                <p className="text-xs text-gray-500">Average Order Value</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 