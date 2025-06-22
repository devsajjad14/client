'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface CustomerData {
  date: string
  newCustomers: number
  activeCustomers: number
  orders: number
  revenue: number
}

interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  averageOrderValue: number
  repeatPurchaseRate: number
}

export function CustomerChart() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<{
    customerData: CustomerData[]
    metrics: CustomerMetrics
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeRange = searchParams.get('timeRange') || '30d'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let url = `/api/reports/customer-insights?timeRange=${timeRange}`
        if (startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch data')
        
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [searchParams])

  if (!data) return null

  const chartData = [
    {
      name: 'New Customers',
      value: data.customerData.reduce((sum, day) => sum + (day.newCustomers || 0), 0),
      fill: '#82ca9d'
    },
    {
      name: 'Active Customers',
      value: data.customerData.reduce((sum, day) => sum + (day.activeCustomers || 0), 0),
      fill: '#ffc658'
    },
    {
      name: 'Repeat Customers',
      value: data.metrics.repeatPurchaseRate,
      fill: '#ff8042'
    },
    {
      name: 'One-time Customers',
      value: 100 - data.metrics.repeatPurchaseRate,
      fill: '#8884d8'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Growth & Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => {
                  if (percent === 0) return ''
                  return `${name}: ${(percent * 100).toFixed(0)}%`
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'Repeat Customers' || name === 'One-time Customers') {
                    return [`${value.toFixed(1)}%`, name]
                  }
                  return [value.toLocaleString(), name]
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 