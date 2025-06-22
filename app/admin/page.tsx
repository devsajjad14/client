'use client'

import { Header } from '@/components/admin/layout/Header'
import { StatsGrid } from '@/components/admin/dashboard/StatsGrid'
import { AnalyticsCharts } from '@/components/admin/dashboard/AnalyticsCharts'
import { DataTable } from '@/components/admin/data/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FiCheck,
  FiClock,
  FiX,
  FiAlertTriangle,
  FiPlus,
  FiUsers,
  FiDownload,
  FiSettings,
  FiTrendingUp,
  FiShoppingBag,
  FiPackage,
  FiStar,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiArrowRight,
} from 'react-icons/fi'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { useState, useEffect } from 'react'
import { DateRangeSelector } from './components/DateRangeSelector'
import { DateRange } from 'react-day-picker'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

type Order = {
  id: string
  customer: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled' | 'failed'
  payment: string
}

const OrderTable = ({ orders }: { orders: Order[] }) => {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
            <FiShoppingBag className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <span className='font-medium text-blue-600 dark:text-blue-400'>
            {row.getValue('id')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <FiClock className='w-4 h-4 text-gray-600 dark:text-gray-400' />
          </div>
          <span>{new Date(row.getValue('date')).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        return (
          <div className='flex items-center space-x-2'>
            <div className='p-2 bg-green-50 dark:bg-green-900/30 rounded-lg'>
              <FiDollarSign className='w-4 h-4 text-green-600 dark:text-green-400' />
            </div>
            <span className='font-medium'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<
          'completed' | 'pending' | 'cancelled' | 'failed'
        >('status')
        const iconMap = {
          completed: <FiCheck className='w-4 h-4' />,
          pending: <FiClock className='w-4 h-4' />,
          cancelled: <FiX className='w-4 h-4' />,
          failed: <FiAlertTriangle className='w-4 h-4' />,
        }
        const variantMap = {
          completed: 'default',
          pending: 'secondary',
          cancelled: 'destructive',
          failed: 'destructive',
        } as const
        const bgMap = {
          completed: 'bg-green-50 dark:bg-green-900/30',
          pending: 'bg-blue-50 dark:bg-blue-900/30',
          cancelled: 'bg-red-50 dark:bg-red-900/30',
          failed: 'bg-red-50 dark:bg-red-900/30',
        } as const

        return (
          <div className='flex items-center space-x-2'>
            <div className={`p-2 ${bgMap[status]} rounded-lg`}>
              {iconMap[status]}
            </div>
            <Badge variant={variantMap[status]} className='capitalize'>
              {status}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg'>
            <FiCreditCard className='w-4 h-4 text-purple-600 dark:text-purple-400' />
          </div>
          <span className='capitalize'>{row.getValue('payment')}</span>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'
    />
  )
}

// New data for sales forecast
const salesForecastData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Actual Sales',
      data: [4000, 3000, 5000, 2780, 1890, 2390],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    },
    {
      label: 'Forecast',
      data: [4200, 3500, 4800, 3000, 2000, 2500],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1,
    },
  ],
}

const salesByCategoryData = {
  labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Other'],
  datasets: [
    {
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(139, 92, 246)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
    },
  ],
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number | string) {
          if (typeof value === 'number') {
            return `$${value.toLocaleString()}`
          }
          return value
        },
      },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || ''
          const value = context.raw || 0
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          )
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${percentage}%`
        },
      },
    },
  },
  cutout: '70%',
}

const CustomerSatisfaction = () => (
  <Card className='p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
    <div className='flex items-center justify-between mb-4'>
      <h3 className='text-lg font-semibold'>Customer Satisfaction</h3>
    </div>
    <div className='space-y-4'>
      <div>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm opacity-80'>Overall Rating</span>
          <span className='text-2xl font-bold'>4.8/5</span>
        </div>
        <div className='h-2 w-full bg-white/20 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white rounded-full transition-all duration-500'
            style={{ width: '96%' }}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-white/10 rounded-lg p-3'>
          <p className='text-sm opacity-80'>Positive Reviews</p>
          <p className='text-xl font-bold mt-1'>92%</p>
        </div>
        <div className='bg-white/10 rounded-lg p-3'>
          <p className='text-sm opacity-80'>Response Rate</p>
          <p className='text-xl font-bold mt-1'>98%</p>
        </div>
      </div>
    </div>
  </Card>
)

const SalesForecast = () => (
  <Card className='p-6'>
    <div className='flex items-center justify-between mb-6'>
      <h3 className='text-lg font-semibold'>Sales Forecast</h3>
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='h-[300px]'>
        <Bar data={salesForecastData} options={chartOptions} />
      </div>
      <div className='h-[300px]'>
        <Doughnut data={salesByCategoryData} options={doughnutOptions} />
      </div>
    </div>
  </Card>
)

const QuickActions = () => (
  <Card className='p-6'>
    <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
    <div className='grid grid-cols-2 gap-4'>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
        <FiPlus className='w-5 h-5' />
        <span>New Order</span>
      </Button>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 text-white'>
        <FiUsers className='w-5 h-5' />
        <span>Add Customer</span>
      </Button>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
        <FiDownload className='w-5 h-5' />
        <span>Export Data</span>
      </Button>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white'>
        <FiSettings className='w-5 h-5' />
        <span>Settings</span>
      </Button>
    </div>
  </Card>
)

const PerformanceMetrics = () => (
  <Card className='p-6'>
    <h3 className='text-lg font-semibold mb-4'>Performance Metrics</h3>
    <div className='space-y-4'>
      <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
            <FiTrendingUp className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <p className='font-medium'>Average Order Value</p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Last 30 days
            </p>
          </div>
        </div>
        <span className='text-lg font-bold'>$156.80</span>
      </div>
      <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
            <FiShoppingBag className='w-5 h-5 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <p className='font-medium'>Cart Abandonment</p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Last 30 days
            </p>
          </div>
        </div>
        <span className='text-lg font-bold'>12.4%</span>
      </div>
    </div>
  </Card>
)

const InventoryStatus = () => (
  <Card className='p-6 h-[500px] flex flex-col'>
    <div className='flex items-center justify-between mb-4'>
      <h3 className='text-lg font-semibold'>Inventory Status</h3>
    </div>
    <div className='flex-1 min-h-0 overflow-y-auto'>
      <div className='space-y-6'>
        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Low Stock Items</span>
            <span className='text-sm text-red-600 dark:text-red-400'>
              12 Items
            </span>
          </div>
          <Progress value={12} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>
            Items below minimum threshold
          </p>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Out of Stock</span>
            <span className='text-sm text-red-600 dark:text-red-400'>
              5 Items
            </span>
          </div>
          <Progress value={5} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>
            Items requiring immediate attention
          </p>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Top Selling Products</span>
            <span className='text-sm text-green-600 dark:text-green-400'>
              In Stock
            </span>
          </div>
          <div className='space-y-2 mt-2'>
            <div className='flex justify-between text-sm'>
              <span>Premium Headphones</span>
              <span className='text-green-600'>45 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Wireless Mouse</span>
              <span className='text-green-600'>38 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Mechanical Keyboard</span>
              <span className='text-green-600'>29 units</span>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Recent Restocks</span>
            <span className='text-sm text-blue-600 dark:text-blue-400'>
              Last 7 days
            </span>
          </div>
          <div className='space-y-2 mt-2'>
            <div className='flex justify-between text-sm'>
              <span>Gaming Monitor</span>
              <span className='text-blue-600'>+50 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Smart Watch</span>
              <span className='text-blue-600'>+30 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Bluetooth Speaker</span>
              <span className='text-blue-600'>+25 units</span>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Inventory Value</span>
            <span className='text-sm text-purple-600 dark:text-purple-400'>
              $245,890
            </span>
          </div>
          <Progress value={75} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>
            Total value of current inventory
          </p>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Return Rate</span>
            <span className='text-sm text-yellow-600 dark:text-yellow-400'>
              2.4%
            </span>
          </div>
          <Progress value={2.4} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>Last 30 days return rate</p>
        </div>
      </div>
    </div>
  </Card>
)

// Update chart data
const customerSegmentsData = {
  labels: ['New Customers', 'Returning', 'Loyal', 'Inactive'],
  datasets: [
    {
      data: [35, 40, 20, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
    },
  ],
}

const revenueProfitData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [45000, 52000, 48000, 55000, 62000, 58000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Profit',
      data: [15000, 18000, 16000, 19000, 22000, 20000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
}

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || ''
          const value = context.raw || 0
          return `${label}: ${value}%`
        },
      },
    },
  },
  cutout: '60%',
}

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number | string) {
          if (typeof value === 'number') {
            return value >= 1000
              ? `$${(value / 1000).toFixed(1)}k`
              : `$${value}`
          }
          return value
        },
      },
    },
  },
}

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [lowStockItems, setLowStockItems] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topCategories, setTopCategories] = useState<
    Array<{
      name: string
      value: number
      color: string
      orderCount: number
      totalSales: number
    }>
  >([])
  const [trendingProducts, setTrendingProducts] = useState<
    Array<{
      id: string
      name: string
      style: string
      image: string
      orders: number
      sales: number
      stock: number
    }>
  >([])
  const [salesForecastData, setSalesForecastData] = useState({
    labels: [],
    datasets: [],
  })
  const [salesByCategoryData, setSalesByCategoryData] = useState({
    labels: [],
    datasets: [],
  })
  const [inventoryInsights, setInventoryInsights] = useState<{
    lowStockItems: number
    outOfStockItems: number
    topSellingProducts: Array<{
      name: string
      stock: number
    }>
    inventoryValue: number
    recentRestocks: Array<{
      name: string
      stock: number
    }>
    returnRate: number
  }>({
    lowStockItems: 0,
    outOfStockItems: 0,
    topSellingProducts: [],
    inventoryValue: 0,
    recentRestocks: [],
    returnRate: 0,
  })
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Format dates for API
        const fromDate = dateRange.from ? dateRange.from.toISOString() : ''
        const toDate = dateRange.to ? dateRange.to.toISOString() : ''

        // Fetch dashboard stats
        const statsResponse = await fetch(
          `/api/admin/dashboard/stats?from=${fromDate}&to=${toDate}`
        )
        const statsData = await statsResponse.json()
        setTotalRevenue(statsData.totalRevenue)
        setTotalOrders(statsData.totalOrders)
        setTotalUsers(statsData.totalUsers)
        setLowStockItems(statsData.lowStockItems)

        // Fetch sales forecast and category data
        const salesResponse = await fetch(
          `/api/admin/dashboard/sales-forecast?from=${fromDate}&to=${toDate}`
        )
        const salesData = await salesResponse.json()
        setSalesForecastData(salesData.salesData)
        setSalesByCategoryData(salesData.categoryData)

        // Fetch recent orders
        const ordersResponse = await fetch(
          `/api/admin/dashboard/recent-orders?from=${fromDate}&to=${toDate}`
        )
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData)

        // Fetch top categories
        const categoriesResponse = await fetch(
          `/api/admin/dashboard/top-categories?from=${fromDate}&to=${toDate}`
        )
        const categoriesData = await categoriesResponse.json()
        setTopCategories(categoriesData)

        // Fetch trending products
        const productsResponse = await fetch(
          `/api/admin/dashboard/trending-products?from=${fromDate}&to=${toDate}`
        )
        const productsData = await productsResponse.json()
        setTrendingProducts(productsData)

        // Fetch inventory insights
        const inventoryResponse = await fetch(
          `/api/admin/dashboard/inventory-insights?from=${fromDate}&to=${toDate}`
        )
        const inventoryData = await inventoryResponse.json()
        setInventoryInsights(inventoryData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='space-y-8 p-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
            Dashboard
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
            Welcome to your admin dashboard
          </p>
        </div>
        <DateRangeSelector onDateRangeChange={setDateRange} />
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Total Revenue
              </p>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mt-2'>
                ${totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className='p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'>
              <FiTrendingUp className='w-6 h-6' />
            </div>
          </div>
        </Card>

        <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Total Orders
              </p>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mt-2'>
                {totalOrders.toLocaleString()}
              </h3>
            </div>
            <div className='p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'>
              <FiShoppingBag className='w-6 h-6' />
            </div>
          </div>
        </Card>

        <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Total Customers
              </p>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mt-2'>
                {totalUsers.toLocaleString()}
              </h3>
            </div>
            <div className='p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'>
              <FiUsers className='w-6 h-6' />
            </div>
          </div>
        </Card>

        <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Low Stock Items
              </p>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mt-2'>
                {lowStockItems}
              </h3>
            </div>
            <div className='p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'>
              <FiAlertTriangle className='w-6 h-6' />
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Forecast */}
      <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Sales Forecast
          </h3>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='h-[300px]'>
            <Bar data={salesForecastData} options={chartOptions} />
          </div>
          <div className='h-[300px]'>
            <Doughnut data={salesByCategoryData} options={doughnutOptions} />
          </div>
        </div>
      </Card>

      {/* Trending Products and Categories */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Trending Products */}
        <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Trending Products
            </h3>
          </div>
          <div className='space-y-4'>
            {trendingProducts.map((product) => (
              <div
                key={product.id}
                className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
              >
                <div className='flex items-center space-x-4'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-12 h-12 object-cover rounded'
                  />
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      {product.name}
                    </h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Style: {product.style}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {product.orders} orders
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    ${product.sales.toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Stock: {product.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Categories */}
        <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Top Categories
            </h3>
          </div>
          <div className='space-y-4'>
            {topCategories.map((category) => (
              <div key={category.name} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {category.name}
                  </span>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {category.value}%
                  </span>
                </div>
                <div className='h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className={`h-full ${category.color} rounded-full transition-all duration-500`}
                    style={{ width: `${category.value}%` }}
                  />
                </div>
                <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                  <span>{category.orderCount} orders</span>
                  <span>${category.totalSales.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inventory Insights */}
      <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Inventory Insights
          </h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Low Stock Items
              </span>
              <span className='text-sm font-medium text-red-600 dark:text-red-400'>
                {inventoryInsights.lowStockItems} Items
              </span>
            </div>
            <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
              <div
                className='h-full bg-red-500 rounded-full transition-all duration-500'
                style={{
                  width: `${(inventoryInsights.lowStockItems / 100) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Out of Stock
              </span>
              <span className='text-sm font-medium text-red-600 dark:text-red-400'>
                {inventoryInsights.outOfStockItems} Items
              </span>
            </div>
            <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
              <div
                className='h-full bg-red-500 rounded-full transition-all duration-500'
                style={{
                  width: `${(inventoryInsights.outOfStockItems / 100) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Inventory Value
              </span>
              <span className='text-sm font-medium text-green-600 dark:text-green-400'>
                ${inventoryInsights.inventoryValue.toLocaleString()}
              </span>
            </div>
            <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
              <div
                className='h-full bg-green-500 rounded-full transition-all duration-500'
                style={{ width: '75%' }}
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            <div className='flex items-center justify-between mb-4'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Top Selling Products
              </span>
              <span className='text-sm text-green-600 dark:text-green-400'>
                In Stock
              </span>
            </div>
            <div className='space-y-2'>
              {inventoryInsights.topSellingProducts.map((product) => (
                <div
                  key={product.name}
                  className='flex justify-between text-sm'
                >
                  <span>{product.name}</span>
                  <span className='text-green-600'>{product.stock} units</span>
                </div>
              ))}
            </div>
          </div>

          <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            <div className='flex items-center justify-between mb-4'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Recent Restocks
              </span>
              <span className='text-sm text-blue-600 dark:text-blue-400'>
                Last 7 days
              </span>
            </div>
            <div className='space-y-2'>
              {inventoryInsights.recentRestocks.map((product) => (
                <div
                  key={product.name}
                  className='flex justify-between text-sm'
                >
                  <span>{product.name}</span>
                  <span className='text-blue-600'>+{product.stock} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Return Rate
              </span>
              <span className='text-sm text-yellow-600 dark:text-yellow-400'>
                {inventoryInsights.returnRate}%
              </span>
            </div>
            <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
              <div
                className='h-full bg-yellow-500 rounded-full transition-all duration-500'
                style={{ width: `${inventoryInsights.returnRate}%` }}
              />
            </div>
            <p className='text-xs text-gray-500 mt-2'>
              Last 30 days return rate
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Recent Orders
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              Latest transactions and order status
            </p>
          </div>
        </div>
        <OrderTable orders={recentOrders} />
      </Card>

      {/* Cart Abandonment Analytics */}
      <Card className='p-6 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm relative overflow-hidden'>
        {/* Coming Soon Overlay */}
        <div className='absolute inset-0 z-20 backdrop-blur-[1px] bg-white/40 dark:bg-gray-800/40 flex items-center justify-center'>
          <div className='text-center px-4 bg-white/60 dark:bg-gray-800/60 py-8 rounded-2xl backdrop-blur-sm'>
            <div className='w-16 h-16 mb-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto'>
              <FiShoppingBag className='w-8 h-8 text-blue-600 dark:text-blue-400' />
            </div>
            <h4 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              Coming Soon
            </h4>
            <p className='text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6'>
              Cart abandonment analytics are being prepared. This feature will
              help you track and recover lost sales opportunities.
            </p>
            <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 justify-center'>
              <FiClock className='w-4 h-4' />
              <span>Feature in development</span>
            </div>
          </div>
        </div>

        {/* Existing Content with Reduced Opacity */}
        <div className='relative z-10'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Cart Abandonment Analytics
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Track and recover abandoned carts
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            >
              <span>View Details</span>
              <FiArrowRight className='w-4 h-4' />
            </Button>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Key Metrics */}
            <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-red-100 dark:bg-red-900/30 rounded-lg'>
                    <FiShoppingBag className='w-5 h-5 text-red-600 dark:text-red-400' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Abandonment Rate
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>
                      68.5%
                    </p>
                  </div>
                </div>
                <div className='text-sm text-red-600 dark:text-red-400'>
                  +2.3%
                </div>
              </div>
              <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-red-500 rounded-full transition-all duration-500'
                  style={{ width: '68.5%' }}
                />
              </div>
            </div>

            <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                    <FiTrendingUp className='w-5 h-5 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Recovery Rate
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>
                      24.8%
                    </p>
                  </div>
                </div>
                <div className='text-sm text-green-600 dark:text-green-400'>
                  +5.2%
                </div>
              </div>
              <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-green-500 rounded-full transition-all duration-500'
                  style={{ width: '24.8%' }}
                />
              </div>
            </div>

            <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                    <FiDollarSign className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Lost Revenue
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>
                      $12.4K
                    </p>
                  </div>
                </div>
                <div className='text-sm text-red-600 dark:text-red-400'>
                  -8.1%
                </div>
              </div>
              <div className='h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-500 rounded-full transition-all duration-500'
                  style={{ width: '45%' }}
                />
              </div>
            </div>
          </div>

          {/* Recent Abandoned Carts */}
          <div className='mt-6'>
            <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>
              Recent Abandoned Carts
            </h4>
            <div className='space-y-4'>
              {[
                {
                  id: 'CART-001',
                  customer: 'John Smith',
                  items: 3,
                  value: 249.99,
                  time: '2 hours ago',
                  status: 'pending',
                },
                {
                  id: 'CART-002',
                  customer: 'Sarah Johnson',
                  items: 2,
                  value: 179.5,
                  time: '3 hours ago',
                  status: 'recovered',
                },
                {
                  id: 'CART-003',
                  customer: 'Michael Brown',
                  items: 4,
                  value: 399.99,
                  time: '4 hours ago',
                  status: 'pending',
                },
              ].map((cart) => (
                <div
                  key={cart.id}
                  className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'
                >
                  <div className='flex items-center gap-4'>
                    <div className='p-2 bg-gray-100 dark:bg-gray-600 rounded-lg'>
                      <FiShoppingBag className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                    </div>
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {cart.customer}
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {cart.items} items • {cart.time}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      ${cart.value}
                    </span>
                    <Badge
                      variant={
                        cart.status === 'recovered' ? 'default' : 'secondary'
                      }
                      className='capitalize'
                    >
                      {cart.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
