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
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiX,
  FiEdit2,
  FiEye,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiClock,
  FiList,
  FiArrowLeft,
  FiLoader,
  FiTrash2,
  FiFileText,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiTag,
  FiBarChart2,
  FiPlus,
  FiEdit,
  FiCheck,
  FiPieChart,
  FiCircle,
  FiInbox,
} from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

type Refund = {
  id: number
  orderId: number
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  refundMethod: 'original_payment' | 'store_credit' | 'bank_transfer'
  refundedBy: number | null
  notes: string | null
  attachments: string[] | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  refundTransactionId: string | null
  customerEmail: string | null
  customerName: string | null
  refundItems?: {
    productId: number
    quantity: number
    amount: number
    reason: string
  }[]
  adminNotes: string | null
  refundPolicy: string
  refundType: 'full' | 'partial'
  refundFee: number
  refundCurrency: string
  refundStatusHistory: {
    status: string
    timestamp: string
    note: string
    updatedBy: number
  }[]
  refundDocuments: {
    type: string
    url: string
    name: string
    uploadedAt: string
  }[]
  refundCommunication: {
    type: string
    content: string
    timestamp: string
    sender: string
  }[]
  refundAnalytics: {
    processingTime: number
    customerSatisfaction: number
    refundReasonCategory: string
    refundPattern: string
  } | null
  orderTotal?: number
}

export default function RefundsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [refundsList, setRefundsList] = useState<Refund[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    refundMethod: 'all',
    dateRange: 'all',
    refundType: 'all',
  })
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [selectedRefunds, setSelectedRefunds] = useState<number[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [refundToDelete, setRefundToDelete] = useState<Refund | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedRefundForStatus, setSelectedRefundForStatus] = useState<Refund | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    loadRefunds()
  }, [])

  const loadRefunds = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/refunds')
      if (!response.ok) throw new Error('Failed to fetch refunds')
      const data = await response.json()
      setRefundsList(data)
    } catch (error) {
      console.error('Error loading refunds:', error)
      toast.error('Failed to load refunds')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/refunds/search?q=${encodeURIComponent(searchQuery)}`
      )
      if (!response.ok) throw new Error('Failed to search refunds')
      const data = await response.json()
      setRefundsList(data)
    } catch (error) {
      console.error('Error searching refunds:', error)
      toast.error('Failed to search refunds')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRefund = async (refund: Refund) => {
    try {
      // Fetch order details to get the total amount
      const response = await fetch(`/api/orders/${refund.orderId}`)
      if (!response.ok) throw new Error('Failed to fetch order details')
      const orderData = await response.json()
      
      // Set the selected refund with order total - using actual amounts
      setSelectedRefund({
        ...refund,
        orderTotal: orderData.totalAmount,
        // If amount is in cents (> 1000 for a typical refund), convert it
        amount: refund.amount > 1000 ? refund.amount / 100 : refund.amount
      })
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error loading order details:', error)
      toast.error('Failed to load complete refund details')
      // If we can't get the order total, still show the refund with amount conversion if needed
      setSelectedRefund({
        ...refund,
        amount: refund.amount > 1000 ? refund.amount / 100 : refund.amount
      })
      setIsViewDialogOpen(true)
    }
  }

  const handleCreateRefund = () => {
    router.push('/admin/sales/refunds/add')
  }

  const handleDeleteRefund = async (refund: Refund) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/refunds?id=${refund.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete refund')

      toast.success('Refund deleted successfully')
      loadRefunds()
      setIsDeleteDialogOpen(false)
      setRefundToDelete(null)
    } catch (error) {
      console.error('Error deleting refund:', error)
      toast.error('Failed to delete refund')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditRefund = (refund: Refund) => {
    router.push(`/admin/sales/refunds/edit/${refund.id}`)
  }

  const handleStatusUpdate = async () => {
    if (!selectedRefundForStatus) return

    try {
      setIsUpdatingStatus(true)
      const response = await fetch(`/api/refunds/${selectedRefundForStatus.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Refund marked as ${newStatus}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      toast.success('Status updated successfully')
      loadRefunds()
      setIsStatusDialogOpen(false)
      setSelectedRefundForStatus(null)
      setNewStatus('pending')
      setStatusNote('')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusBadgeColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string | undefined | null) => {
    if (!status) return <FiCircle className="h-4 w-4" />
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock className="h-4 w-4" />
      case 'approved':
        return <FiCheckCircle className="h-4 w-4" />
      case 'completed':
        return <FiCheck className="h-4 w-4" />
      case 'rejected':
        return <FiX className="h-4 w-4" />
      default:
        return <FiCircle className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateRefundStats = () => {
    const total = refundsList.length
    const partialRefunds = refundsList.filter(r => r.refundType === 'partial').length
    const fullRefunds = refundsList.filter(r => r.refundType === 'full').length
    const totalAmount = refundsList.reduce((sum, r) => sum + r.amount, 0)

    return {
      total,
      partialRefunds,
      fullRefunds,
      totalAmount,
      partialPercentage: (partialRefunds / total) * 100 || 0,
      fullPercentage: (fullRefunds / total) * 100 || 0,
    }
  }

  const stats = calculateRefundStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refunds</h1>
          <p className="text-muted-foreground">
            Manage and process customer refunds
          </p>
        </div>
        <Button onClick={handleCreateRefund}>
          <FiPlus className="mr-2 h-4 w-4" />
          New Refund
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold">{stats.total}</h2>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(stats.totalAmount)}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <FiDollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Progress value={100} className="mt-4" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Partial Refunds</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold">{stats.partialRefunds}</h2>
                <span className="text-sm text-muted-foreground">
                  {((stats.partialRefunds / stats.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="rounded-full bg-amber-100 p-3">
              <FiPieChart className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <Progress value={stats.partialPercentage} className="mt-4" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Refunds</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold">{stats.fullRefunds}</h2>
                <span className="text-sm text-muted-foreground">
                  {((stats.fullRefunds / stats.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <FiCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Progress value={stats.fullPercentage} className="mt-4" />
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search refunds..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <FiChevronUp className="h-4 w-4" />
              ) : (
                <FiChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadRefunds}
              disabled={isLoading}
            >
              <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowAnalytics(!showAnalytics)}>
              <FiBarChart2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.refundMethod}
              onValueChange={(value) =>
                setFilters({ ...filters, refundMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Refund Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="original_payment">Original Payment</SelectItem>
                <SelectItem value="store_credit">Store Credit</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters({ ...filters, dateRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.refundType}
              onValueChange={(value) =>
                setFilters({ ...filters, refundType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Refund Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full">Full Refund</SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Refund Status</DialogTitle>
            <DialogDescription>
              Change the status of refund #{selectedRefundForStatus?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: 'pending' | 'approved' | 'completed' | 'rejected') => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <FiClock className="h-4 w-4 text-yellow-600" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <FiCheck className="h-4 w-4 text-blue-600" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <FiX className="h-4 w-4 text-red-600" />
                      <span>Rejected</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refunds List */}
      <Card>
        <ScrollArea className="h-[600px]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <FiLoader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : refundsList.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center space-y-2">
                <FiAlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No refunds found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {refundsList.map((refund) => (
                  <div
                    key={refund.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <p className="font-medium">Refund #{refund.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{refund.orderId}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        <span>{refund.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">{formatCurrency(refund.amount)}</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewRefund(refund)}
                        >
                          <FiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setRefundToDelete(refund)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* View Refund Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <FiDollarSign className="h-5 w-5 text-blue-600" />
              Refund #{selectedRefund?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-6">
              {/* Main Refund Card */}
              <Card className="p-6 bg-white/50 backdrop-blur-sm border-gray-200/50">
                <div className="grid gap-6">
                  {/* Order and Amount Info */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Order Reference</p>
                      <p className="text-lg font-semibold">#{selectedRefund.orderId}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground">Refund Amount</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedRefund.amount)}</p>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order Total</span>
                        <span className="font-medium">{formatCurrency(selectedRefund.orderTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount Refunded</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedRefund.amount)}</span>
                      </div>
                      {selectedRefund.refundType === 'partial' && (
                        <>
                          <Separator className="my-1" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Remaining Amount</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(Math.max(0, (selectedRefund.orderTotal || 0) - selectedRefund.amount))}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Refund Progress</span>
                              <span>
                                {Math.min(100, Math.round((selectedRefund.amount / (selectedRefund.orderTotal || 1)) * 100))}%
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(100, (selectedRefund.amount / (selectedRefund.orderTotal || 1)) * 100)}
                              className="h-2"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Refund Details */}
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Refund Type</p>
                        <Badge variant="outline" className="capitalize">
                          {selectedRefund.refundType}
                        </Badge>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <Badge variant="outline" className="capitalize">
                          {(selectedRefund.refundMethod || '').replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">{formatDate(selectedRefund.createdAt)}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="text-sm font-medium">{formatDate(selectedRefund.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reason and Notes */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Reason for Refund</p>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        {selectedRefund.reason || 'No reason provided'}
                      </div>
                    </div>
                    {selectedRefund.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Additional Notes</p>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                          {selectedRefund.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this refund? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (refundToDelete) {
                  handleDeleteRefund(refundToDelete)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
