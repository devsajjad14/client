'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiChevronDown,
  FiArrowLeft,
} from 'react-icons/fi'
import { toast } from 'sonner'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { Line as ChartLine, Bar as ChartBar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
  ChartOptions,
  ScaleOptions,
  TooltipItem,
  ChartData
} from 'chart.js'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { addDays, format, isWithinInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { useRouter } from 'next/navigation'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
)

interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
  revenueMA: number
  ordersMA: number
  customersMA: number
}

interface CategoryData {
  category: string
  revenue: number
  orders: number
  type: string | null
}

interface ProductData {
  name: string
  sales: number
  revenue: number
}

interface Metrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  aovChange: number
  customersChange: number
}

interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueChange: number
  ordersChange: number
  aovChange: number
  customersChange: number
}

interface SalesTrend {
  date: string
  revenue: number
  orders: number
  customers: number
  revenueMA: number
  ordersMA: number
  customersMA: number
}

interface AnalyticsContextType {
  timeRange: string
  setTimeRange: (range: string) => void
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  isCustomRange: boolean
  setIsCustomRange: (isCustom: boolean) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const MetricsCard = () => {
  const { timeRange, dateRange, isCustomRange } = useAnalytics()
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    aovChange: 0,
    customersChange: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/reports/sales/metrics'
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url = `/api/reports/sales/metrics?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      } else {
        url = `/api/reports/sales/metrics?timeRange=${timeRange}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch metrics')
      }
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch metrics')
      toast.error(error instanceof Error ? error.message : 'Failed to fetch metrics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [timeRange, dateRange, isCustomRange])

  if (isLoading) {
    return (
      <>
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (error) {
    return (
      <Card className="col-span-4">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchMetrics()}>
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.revenueChange >= 0 ? '+' : ''}{formatPercentage(metrics.revenueChange)} from last period
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalOrders)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.ordersChange >= 0 ? '+' : ''}{formatPercentage(metrics.ordersChange)} from last period
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FiShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.aovChange >= 0 ? '+' : ''}{formatPercentage(metrics.aovChange)} from last period
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FiTrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.customersChange >= 0 ? '+' : ''}{formatPercentage(metrics.customersChange)} from last period
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default function SalesAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    aovChange: 0,
    customersChange: 0
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [productData, setProductData] = useState<ProductData[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCustomRange, setIsCustomRange] = useState(false)
  const router = useRouter()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let baseUrl = `/api/reports/sales`
      let queryParams = isCustomRange && dateRange?.from && dateRange?.to
        ? `startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
        : `timeRange=${timeRange}`

      console.log('Loading data with params:', queryParams)

      // Fetch metrics
      const metricsRes = await fetch(`${baseUrl}/metrics?${queryParams}`)
      if (!metricsRes.ok) {
        const errorData = await metricsRes.json()
        throw new Error(errorData.details || 'Failed to fetch metrics')
      }
      const metricsData = await metricsRes.json()
      console.log('Metrics data:', metricsData)
      setMetrics(metricsData)

      // Fetch sales trend
      const salesRes = await fetch(`${baseUrl}/trend?${queryParams}`)
      if (!salesRes.ok) {
        const errorData = await salesRes.json()
        throw new Error(errorData.details || 'Failed to fetch sales trend')
      }
      const salesTrendData = await salesRes.json()
      console.log('Sales trend data:', salesTrendData)
      setSalesData(salesTrendData)

      // Fetch category data
      const categoryRes = await fetch(`${baseUrl}/categories?${queryParams}`)
      if (!categoryRes.ok) {
        const errorData = await categoryRes.json()
        throw new Error(errorData.details || 'Failed to fetch categories')
      }
      const categoryData = await categoryRes.json()
      console.log('Category data:', categoryData)
      setCategoryData(categoryData)

      // Fetch product data
      const productRes = await fetch(`${baseUrl}/products?${queryParams}`)
      if (!productRes.ok) {
        const errorData = await productRes.json()
        throw new Error(errorData.details || 'Failed to fetch products')
      }
      const productData = await productRes.json()
      console.log('Product data:', productData)
      setProductData(productData)

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sales data')
      toast.error(error instanceof Error ? error.message : 'Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Effect triggered with:', { timeRange, dateRange, isCustomRange })
    loadData()
  }, [timeRange, dateRange, isCustomRange])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setIsCustomRange(true)
      setTimeRange('custom')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/reports/sales/export?timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export sales data')
    }
  }

  const chartData: ChartData<'line'> = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map(d => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Revenue (3-day MA)',
        data: salesData.map(d => d.revenueMA),
        borderColor: 'rgb(147, 197, 253)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
      }
    ]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return formatCurrency(value)
            }
            return value
          }
        }
      }
    }
  }

  // Calculate summary metrics
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0)
  const totalCustomers = salesData.reduce((sum, d) => sum + d.customers, 0)

  console.log('Summary metrics:', {
    totalRevenue,
    totalOrders,
    totalCustomers
  })

  return (
    <AnalyticsContext.Provider value={{
      timeRange,
      setTimeRange,
      dateRange: dateRange || undefined,
      setDateRange: handleDateSelect,
      isCustomRange,
      setIsCustomRange
    }}>
      <div className="space-y-6">
        {/* Top Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <FiArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
              <p className="text-muted-foreground">
                Track your sales performance and revenue metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTimeRange('7d')
                setIsCustomRange(false)
                setDateRange({ from: undefined, to: undefined })
              }}
              className={timeRange === '7d' && !isCustomRange ? 'bg-primary text-primary-foreground' : ''}
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
                setDateRange({ from: undefined, to: undefined })
              }}
              className={timeRange === '30d' && !isCustomRange ? 'bg-primary text-primary-foreground' : ''}
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
                setDateRange({ from: undefined, to: undefined })
              }}
              className={timeRange === '90d' && !isCustomRange ? 'bg-primary text-primary-foreground' : ''}
            >
              <FiCalendar className="mr-2 h-4 w-4" />
              90 Days
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={isCustomRange ? 'default' : 'outline'}
                  className={cn(
                    'justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <FiCalendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Custom Range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range)
                    setIsCustomRange(true)
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleExport}>
              <FiDownload className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" onClick={loadData}>
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.revenueChange >= 0 ? '+' : ''}{formatPercentage(metrics.revenueChange)} from last period
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiDollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalOrders)}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.ordersChange >= 0 ? '+' : ''}{formatPercentage(metrics.ordersChange)} from last period
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FiShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.aovChange >= 0 ? '+' : ''}{formatPercentage(metrics.aovChange)} from last period
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <FiTrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalCustomers)}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.customersChange >= 0 ? '+' : ''}{formatPercentage(metrics.customersChange)} from last period
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <FiUsers className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
                <p className="text-sm text-gray-500">Daily revenue with 3-day moving average</p>
              </div>
              
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500">Loading sales data...</p>
                  </div>
                </div>
              ) : salesData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">No sales data available</p>
                  </div>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ChartLine data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution and Top Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryDistribution />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div 
                        key={index} 
                        className="relative group p-4 rounded-lg border border-gray-100 bg-gray-50 animate-pulse"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-40 bg-gray-200 rounded"></div>
                              <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : productData.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No product data available
                  </div>
                ) : (
                  productData.map((product, index) => (
                    <div 
                      key={product.name} 
                      className="relative group p-4 rounded-lg border border-gray-100 hover:border-primary/20 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-gray-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors duration-200">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatNumber(product.sales)} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(product.revenue)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(product.revenue / product.sales)} avg. price
                          </div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/20 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(product.revenue / (productData[0]?.revenue || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnalyticsContext.Provider>
  )
}

const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

const CategoryDistribution = () => {
  const { timeRange, dateRange, isCustomRange } = useAnalytics()
  const [data, setData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/reports/sales/categories'
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url = `/api/reports/sales/categories?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      } else {
        url = `/api/reports/sales/categories?timeRange=${timeRange}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch category data')
      }
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching category data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch category data')
      toast.error(error instanceof Error ? error.message : 'Failed to fetch category data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, dateRange, isCustomRange])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchData()}>
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total revenue for percentage calculations
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // Sort data by revenue and take top 10 categories
  const topCategories = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const chartData: ChartData<'bar'> = {
    labels: topCategories.map(item => item.category),
    datasets: [
      {
        label: 'Revenue',
        data: topCategories.map(item => item.revenue),
        backgroundColor: COLORS.map(color => color + '80'), // Add transparency
        borderColor: COLORS,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 10 Categories by Revenue',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number
            return `Revenue: ${formatCurrency(value)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
        grid: {
          color: '#e5e7eb'
        }
      },
    },
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-[400px]">
            <ChartBar data={chartData} options={options} />
          </div>

          {/* Category List */}
          <div className="space-y-3 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
            {topCategories.map((item, index) => (
              <div
                key={`${item.category}-${item.type || index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item.category}</div>
                    {item.type && item.type !== 'EMPTY' && (
                      <div className="text-xs text-gray-500">{item.type}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatCurrency(item.revenue)}</div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(item.orders)} orders • {((item.revenue / totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SalesTrend = () => {
  const { timeRange, dateRange, isCustomRange } = useAnalytics()
  const [data, setData] = useState<SalesTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/reports/sales/trend'
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url = `/api/reports/sales/trend?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      } else {
        url = `/api/reports/sales/trend?timeRange=${timeRange}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch trend data')
      }
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching trend data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch trend data')
      toast.error(error instanceof Error ? error.message : 'Failed to fetch trend data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, dateRange, isCustomRange])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchData()}>
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData: ChartData<'line'> = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Revenue (3-day MA)',
        data: data.map(item => item.revenueMA),
        borderColor: 'rgb(16, 185, 129)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      }
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Sales Trend',
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-[400px]">
          <ChartLine data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
