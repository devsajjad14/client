'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FiUsers, FiDollarSign, FiShoppingCart } from 'react-icons/fi'
import { useSearchParams } from 'next/navigation'

interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  averageOrderValue: number
  repeatPurchaseRate: number
  customerChange: number
  aovChange: number
  repeatRateChange: number
}

export function CustomerMetrics() {
  const searchParams = useSearchParams()
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const timeRange = searchParams.get('timeRange') || '30d'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let url = `/api/reports/customer-insights?timeRange=${timeRange}`
        if (startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch metrics')
        
        const data = await response.json()
        setMetrics(data.metrics)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()
  }, [searchParams])

  if (!metrics) return null

  const formatNumber = (value: number) => {
    return Number(value).toFixed(0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${Number(value).toFixed(2)}%`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <FiUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalCustomers)}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercent(metrics.customerChange)} from previous period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <FiUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.activeCustomers)}</div>
          <p className="text-xs text-muted-foreground">
            Active in last 30 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <FiDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercent(metrics.aovChange)} from previous period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Repeat Purchase Rate</CardTitle>
          <FiShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(metrics.repeatPurchaseRate)}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercent(metrics.repeatRateChange)} from previous period
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 