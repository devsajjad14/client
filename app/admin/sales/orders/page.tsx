'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiX,
  FiEdit2,
  FiEye,
  FiTruck,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiTag,
  FiAlertCircle,
  FiClock,
  FiList,
  FiArrowLeft,
  FiLoader,
  FiTrash2,
} from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrderItem {
  id: string
  orderId: string
  productId: number
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
  product?: {
    id: number
    name: string
    mediumPicture: string | null
    style: string
    brand: string | null
    styleId: number
  }
}

interface Order {
  id: string
  userId: string | null
  guestEmail: string | null
  status: string
  paymentMethod: string | null
  paymentStatus: string
  totalAmount: number
  subtotal: number
  tax: number
  discount: number
  shippingFee: number
  note: string | null
  createdAt: string
  updatedAt: string | null
  items?: OrderItem[]
  statusHistory?: {
    status: string
    date: string
    note: string
    updatedBy: string
  }[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [ordersList, setOrdersList] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    priority: 'all',
  })
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrdersList(data.orders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`)
      if (!response.ok) throw new Error('Failed to fetch order details')
      const data = await response.json()
      console.log('Order details:', data)
      setSelectedOrder(data)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to fetch order details')
    }
  }

  const handleCreateOrder = () => {
    router.push('/admin/sales/orders/add')
  }

  const handleDeleteOrder = async (order: Order) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/orders?id=${order.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete order')

      toast.success('Order deleted successfully')
      loadOrders() // Reload the orders list
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditOrder = (order: Order) => {
    router.push(`/admin/sales/orders/edit/${order.id}`)
  }

  const filteredOrders = ordersList.filter((order) => {
    const searchMatch =
      order.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    const statusMatch =
      filters.status === 'all' || order.status === filters.status

    const paymentStatusMatch =
      filters.paymentStatus === 'all' ||
      order.paymentStatus === filters.paymentStatus

    const priorityMatch =
      filters.priority === 'all' || order.status === filters.priority

    return searchMatch && statusMatch && paymentStatusMatch && priorityMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Alt + S to open status update
      if (e.altKey && e.key === 's' && selectedOrder) {
        setShowStatusUpdate(true)
      }

      // Alt + B to toggle bulk selection
      if (e.altKey && e.key === 'b') {
        setShowBulkUpdate(!showBulkUpdate)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedOrder, showBulkUpdate])

  // Status validation rules
  const validateStatusChange = (
    currentStatus: string,
    newStatus: string
  ): boolean => {
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['cancelled'],
      cancelled: [],
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  const handleStatusUpdate = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      const updatedOrder = await response.json()
      setOrdersList((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: updatedOrder.status,
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status: updatedOrder.status,
                    date: new Date().toISOString(),
                    note: statusNote,
                    updatedBy: 'Admin',
                  },
                ],
              }
            : order
        )
      )

      toast.success('Order status updated successfully')
      setShowStatusUpdate(false)
      setNewStatus('')
      setStatusNote('')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleBulkStatusUpdate = async () => {
    try {
      const response = await fetch('/api/orders/bulk-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: newStatus,
          note: statusNote,
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      const updatedOrders = await response.json()
      setOrdersList((prev) =>
        prev.map((order) =>
          selectedOrders.includes(order.id)
            ? {
                ...order,
                status: updatedOrders.status,
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status: updatedOrders.status,
                    date: new Date().toISOString(),
                    note: statusNote,
                    updatedBy: 'Admin',
                  },
                ],
              }
            : order
        )
      )

      toast.success('Orders status updated successfully')
      setShowBulkUpdate(false)
      setNewStatus('')
      setStatusNote('')
      setSelectedOrders([])
    } catch (error) {
      console.error('Error updating orders status:', error)
      toast.error('Failed to update orders status')
    }
  }

  // Calculate overview statistics
  const totalOrders = ordersList.length
  const totalRevenue = ordersList.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  )
  const pendingOrders = ordersList.filter((o) => o.status === 'pending').length

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => window.history.back()}
          >
            <FiArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Manage your customer orders
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            size='sm'
            className='text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm'
            onClick={handleCreateOrder}
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Orders Overview Cards */}
      <div className='grid grid-cols-3 gap-6'>
        <Card className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm'>
              <FiPackage className='h-6 w-6 text-white' />
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Orders</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {totalOrders}
              </p>
            </div>
          </div>
        </Card>
        <Card className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm'>
              <FiDollarSign className='h-6 w-6 text-white' />
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
              <div className="text-2xl font-semibold text-gray-900">
                ${Number(totalRevenue).toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
        <Card className='p-6'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm'>
              <FiTruck className='h-6 w-6 text-white' />
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Pending Orders
              </p>
              <p className='text-2xl font-semibold text-gray-900'>
                {pendingOrders}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className='p-4'>
        <div className='flex items-center gap-4'>
          <div className='flex-1 relative'>
            <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search by order number, customer name, or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 h-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            />
          </div>
          <div className='relative'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='h-9 px-3 text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 rounded-lg flex items-center gap-2'
            >
              <FiFilter className='h-4 w-4' />
              Filters
              {showFilters ? (
                <FiChevronUp className='h-4 w-4' />
              ) : (
                <FiChevronDown className='h-4 w-4' />
              )}
            </button>

            {showFilters && (
              <div className='absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10'>
                <div className='space-y-4'>
                  {/* Order Status Filter */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Order Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className='w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    >
                      <option value='all'>All Statuses</option>
                      <option value='pending'>Pending</option>
                      <option value='processing'>Processing</option>
                      <option value='shipped'>Shipped</option>
                      <option value='delivered'>Delivered</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Payment Status
                    </label>
                    <select
                      value={filters.paymentStatus}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          paymentStatus: e.target.value,
                        }))
                      }
                      className='w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    >
                      <option value='all'>All Payment Statuses</option>
                      <option value='pending'>Pending</option>
                      <option value='paid'>Paid</option>
                      <option value='failed'>Failed</option>
                      <option value='refunded'>Refunded</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className='w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    >
                      <option value='all'>All Priorities</option>
                      <option value='urgent'>Urgent</option>
                      <option value='high'>High</option>
                      <option value='normal'>Normal</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    onClick={() =>
                      setFilters({
                        status: 'all',
                        paymentStatus: 'all',
                        dateRange: 'all',
                        priority: 'all',
                      })
                    }
                    className='w-full px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <Card className='overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-50 border-b'>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <input
                    type='checkbox'
                    checked={selectedOrders.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(
                          filteredOrders.map((order) => order.id)
                        )
                      } else {
                        setSelectedOrders([])
                      }
                    }}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Order
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Customer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Payment
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Total
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className='text-center py-8'>
                    <div className='flex items-center justify-center gap-2 text-gray-500'>
                      <FiLoader className='h-5 w-5 animate-spin' />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-8 text-gray-500'>
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => order && (
                  <tr key={order.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id])
                          } else {
                            setSelectedOrders(
                              selectedOrders.filter((id) => id !== order.id)
                            )
                          }
                        }}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {order.id.slice(0, 8)}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {order.guestEmail || 'Guest'}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='space-y-1'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                          {order.paymentMethod
                            ? order.paymentMethod.charAt(0).toUpperCase() +
                              order.paymentMethod.slice(1)
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className='p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
                          title='View Details'
                        >
                          <FiEye className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className='p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors'
                          title='Edit Order'
                        >
                          <FiEdit2 className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(order)
                            setIsDeleteDialogOpen(true)
                          }}
                          className='p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors'
                          title='Delete Order'
                        >
                          <FiTrash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='max-w-5xl max-h-[90vh] overflow-hidden flex flex-col'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle className='text-xl font-semibold'>
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className='space-y-6 overflow-y-auto pr-2'>
              {/* Order Header */}
              <div className='flex items-center justify-between pb-4 border-b sticky top-0 bg-white z-10'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      handleEditOrder(selectedOrder)
                    }}
                  >
                    <FiEdit2 className='h-4 w-4 mr-2' />
                    Edit Order
                  </Button>
                </div>
              </div>

              {/* Order Items Section */}
              <div className='px-6 py-4'>
                {!selectedOrder ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedOrder?.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between py-2 border-b last:border-0'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 rounded-md overflow-hidden bg-gray-100'>
                          <img
                            src={item.product?.mediumPicture || '/images/site/placeholder.png'}
                            alt={item.name}
                            className='object-cover w-full h-full'
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/site/placeholder.png'
                            }}
                          />
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {item.name}
                          </p>
                          <p className='text-xs text-gray-500'>
                            Quantity: {item.quantity}
                          </p>
                          {item.product?.style && (
                            <p className='text-xs text-gray-500'>
                              Style: {item.product.style}{' '}
                              {item.product.styleId &&
                                `(ID: ${item.product.styleId})`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>
                          ${Number(item.totalPrice || 0).toFixed(2)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          ${Number(item.unitPrice || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='px-6 py-8 text-center text-gray-500'>
                    No items found in this order
                  </div>
                )}
              </div>
              <div className='px-6 py-4 bg-gray-50 border-t'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Total Items:</span>
                  <span className='font-medium text-gray-900'>
                    {selectedOrder?.items?.length || 0}
                  </span>
                </div>
              </div>

              {/* Payment and Customer Information Grid */}
              <div className='grid grid-cols-2 gap-6 mt-6'>
                {/* Payment Information */}
                <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b bg-gray-50'>
                    <h4 className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                      <FiCreditCard className='h-4 w-4' />
                      Payment Information
                    </h4>
                  </div>
                  <div className='px-6 py-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Subtotal
                        </span>
                        <span className='text-sm text-gray-900'>
                          ${Number(selectedOrder?.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                      {selectedOrder?.shippingFee > 0 && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600'>
                            Shipping
                          </span>
                          <span className='text-sm text-gray-900'>
                            ${Number(selectedOrder?.shippingFee || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {selectedOrder?.discount > 0 && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600'>
                            Discount
                          </span>
                          <span className='text-sm text-gray-900'>
                            ${Number(selectedOrder?.discount || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900'>
                          Total Amount
                        </span>
                        <span className='text-lg font-semibold text-gray-900'>
                          ${Number(selectedOrder?.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b bg-gray-50'>
                    <h4 className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                      <FiUser className='h-4 w-4' />
                      Customer Information
                    </h4>
                  </div>
                  <div className='p-6 space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Email</span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedOrder.guestEmail || 'Guest'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>User ID</span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedOrder.userId || 'N/A'}
                      </span>
                    </div>
                    {selectedOrder.note && (
                      <div className='pt-4 border-t'>
                        <span className='text-sm text-gray-600 block mb-2'>
                          Order Notes
                        </span>
                        <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-lg'>
                          {selectedOrder.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                <div className='px-6 py-4 border-b bg-gray-50'>
                  <h4 className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                    <FiClock className='h-4 w-4' />
                    Order Timeline
                  </h4>
                </div>
                <div className='p-6'>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-4'>
                      <div className='w-2 h-2 mt-2 rounded-full bg-blue-500' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          Order Created
                        </p>
                        <p className='text-xs text-gray-500'>
                          {selectedOrder.createdAt
                            ? new Date(selectedOrder.createdAt).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.updatedAt && (
                      <div className='flex items-start gap-4'>
                        <div className='w-2 h-2 mt-2 rounded-full bg-green-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Last Updated
                          </p>
                          <p className='text-xs text-gray-500'>
                            {new Date(selectedOrder.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]'>
          <Card className='w-full max-w-md p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Update Order Status - #{selectedOrder?.id.slice(0, 8)}
                </h3>
                <button
                  onClick={() => {
                    setShowStatusUpdate(false)
                    setNewStatus('')
                    setStatusNote('')
                  }}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <FiX className='h-5 w-5' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Current Status
                  </label>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder?.status || ''
                    )}`}
                  >
                    {selectedOrder?.status.charAt(0).toUpperCase() +
                      selectedOrder?.status.slice(1)}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className='w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  >
                    <option value=''>Select a status</option>
                    {selectedOrder &&
                      [
                        'pending',
                        'processing',
                        'shipped',
                        'delivered',
                        'cancelled',
                      ]
                        .filter((status) =>
                          validateStatusChange(selectedOrder.status, status)
                        )
                        .map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Note (Optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder='Add a note about this status change...'
                    className='w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
              </div>

              <div className='flex items-center justify-end gap-3 pt-4 border-t'>
                <button
                  onClick={() => {
                    setShowStatusUpdate(false)
                    setNewStatus('')
                    setStatusNote('')
                  }}
                  className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedOrder) {
                      handleStatusUpdate(selectedOrder.id)
                    }
                  }}
                  disabled={!newStatus}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Update Status
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkUpdate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]'>
          <Card className='w-full max-w-md p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Bulk Update Status
                </h3>
                <button
                  onClick={() => {
                    setShowBulkUpdate(false)
                    setNewStatus('')
                    setStatusNote('')
                  }}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <FiX className='h-5 w-5' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Selected Orders
                  </label>
                  <p className='text-sm text-gray-600'>
                    {selectedOrders.length} orders selected
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className='w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  >
                    <option value=''>Select a status</option>
                    <option value='pending'>Pending</option>
                    <option value='processing'>Processing</option>
                    <option value='shipped'>Shipped</option>
                    <option value='delivered'>Delivered</option>
                    <option value='cancelled'>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Note (Optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder='Add a note about this status change...'
                    className='w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>
              </div>

              <div className='flex items-center justify-end gap-3 pt-4 border-t'>
                <button
                  onClick={() => {
                    setShowBulkUpdate(false)
                    setNewStatus('')
                    setStatusNote('')
                  }}
                  className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={!newStatus}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Update {selectedOrders.length} Orders
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Are you sure you want to delete order #
              {orderToDelete?.id.slice(0, 8)}? This action cannot be undone.
            </p>
            <div className='flex items-center justify-end gap-3 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setOrderToDelete(null)
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() =>
                  orderToDelete && handleDeleteOrder(orderToDelete)
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className='flex items-center gap-2'>
                    <FiLoader className='h-4 w-4 animate-spin' />
                    Deleting...
                  </div>
                ) : (
                  'Delete Order'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
