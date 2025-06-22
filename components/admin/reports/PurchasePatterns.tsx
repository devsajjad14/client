'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar, Tooltip, Legend } from 'recharts'

interface PurchasePattern {
  timeOfDay: string
  orders: number
  revenue: number
  averageOrderValue: number
}

export function PurchasePatterns() {
  const searchParams = useSearchParams()
  const [patterns, setPatterns] = useState<PurchasePattern[]>([])

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const timeRange = searchParams.get('timeRange') || '30d'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let url = `/api/reports/customer-insights?timeRange=${timeRange}`
        if (startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch patterns')
        
        const data = await response.json()
        setPatterns(data.purchasePatterns)
      } catch (error) {
        console.error('Error fetching patterns:', error)
      }
    }

    fetchPatterns()
  }, [searchParams])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Purchase Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeOfDay" />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name.includes('Revenue') || name.includes('Average')) {
                    return [`$${value.toLocaleString()}`, name]
                  }
                  return [value.toLocaleString(), name]
                }}
              />
              <Legend />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="#8884d8"
                name="Orders"
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#82ca9d"
                name="Revenue"
              />
              <Bar
                yAxisId="left"
                dataKey="averageOrderValue"
                fill="#ffc658"
                name="Average Order Value"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 