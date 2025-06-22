'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { FiCalendar, FiChevronDown, FiUsers, FiDollarSign, FiShoppingCart, FiDownload, FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'

interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  averageOrderValue: number
  repeatPurchaseRate: number
  customerChange: number
  aovChange: number
  repeatRateChange: number
}

interface CustomerData {
  date: string
  newCustomers: number
  activeCustomers: number
  orders: number
  revenue: number
}

interface TopCustomer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  averageOrderValue: number
}

interface PurchasePattern {
  timeOfDay: string
  orders: number
  revenue: number
  averageOrderValue: number
}

export default function CustomerInsightsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    metrics: CustomerMetrics
    customerData: CustomerData[]
    topCustomers: TopCustomer[]
    purchasePatterns: PurchasePattern[]
  } | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let url = `/api/reports/customer-insights?timeRange=${timeRange}`
      
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
      }

      console.log('Fetching data from:', url)
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      console.log('Received data:', result)
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch customer insights data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, dateRange])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setIsCustomRange(true)
      setTimeRange('custom')
    }
  }

  const handleExport = async () => {
    try {
      let url = `/api/reports/customer/export?timeRange=${timeRange}`
      
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `customer-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export customer data')
    }
  }

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0'
    return Number(value).toFixed(0)
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value))
  }

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0%'
    return `${Number(value).toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Insights</h1>
          <p className="text-muted-foreground">
            Track your customer behavior and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTimeRange('7d')
              setIsCustomRange(false)
              setDateRange(undefined)
            }}
            className={timeRange === '7d' ? 'bg-primary text-primary-foreground' : ''}
          >
            <FiCalendar className="mr-2 h-4 w-4" />
            7 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTimeRange('30d')
              setIsCustomRange(false)
              setDateRange(undefined)
            }}
            className={timeRange === '30d' ? 'bg-primary text-primary-foreground' : ''}
          >
            <FiCalendar className="mr-2 h-4 w-4" />
            30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTimeRange('90d')
              setIsCustomRange(false)
              setDateRange(undefined)
            }}
            className={timeRange === '90d' ? 'bg-primary text-primary-foreground' : ''}
          >
            <FiCalendar className="mr-2 h-4 w-4" />
            90 Days
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground",
                  isCustomRange && "bg-primary text-primary-foreground"
                )}
              >
                <FiCalendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Custom Range</span>
                )}
                <FiChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleExport}>
            <FiDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <FiUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.totalCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(data.metrics.customerChange)} from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <FiUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.activeCustomers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Active in last {timeRange === '7d' ? '7' : timeRange === '90d' ? '90' : '30'} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <FiDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(data.metrics.aovChange)} from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Purchase Rate</CardTitle>
            <FiShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(data.metrics.repeatPurchaseRate)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(data.metrics.repeatRateChange)} from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Growth & Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Growth & Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
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
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => {
                    if (percent === 0) return '';
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {[
                    { fill: '#82ca9d' },
                    { fill: '#ffc658' },
                    { fill: '#ff8042' },
                    { fill: '#8884d8' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Repeat Customers' || name === 'One-time Customers') {
                      return [`${value.toFixed(1)}%`, name];
                    }
                    return [value.toLocaleString(), name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCustomers.map((customer) => (
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

      {/* Customer Purchase Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Purchase Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.purchasePatterns}>
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
    </div>
  )
}
