'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiUsers,
  FiTag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiLoader,
} from 'react-icons/fi'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

type Coupon = {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchaseAmount: number | null
  maxDiscountAmount: number | null
  startDate: string
  endDate: string
  usageLimit: number | null
  usageCount: number
  perCustomerLimit: number | null
  isActive: boolean
  isFirstTimeOnly: boolean
  isNewCustomerOnly: boolean
  excludedProducts: string[]
  excludedCategories: string[]
  includedProducts: string[]
  includedCategories: string[]
  customerGroups: string[]
  createdAt: string
  updatedAt: string
  analytics: {
    totalDiscountsGiven: number
    totalRevenueImpact: number
    averageOrderValue: number
    redemptionRate: number
    lastUsedAt: string | null
  }
}

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    type: 'percentage',
    isActive: true,
    isFirstTimeOnly: false,
    isNewCustomerOnly: false,
    excludedProducts: [],
    excludedCategories: [],
    includedProducts: [],
    includedCategories: [],
    customerGroups: [],
  })

  useEffect(() => {
  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
        if (!response.ok) {
          throw new Error('Failed to load coupons')
        }
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      toast.error('Failed to load coupons')
    } finally {
        setLoading(false)
    }
  }

    loadCoupons()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon)
    setShowDeleteDialog(true)
  }

  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setShowEditDialog(true)
  }

  const handleAddClick = () => {
    setNewCoupon({
      type: 'percentage',
      isActive: true,
      isFirstTimeOnly: false,
      isNewCustomerOnly: false,
      excludedProducts: [],
      excludedCategories: [],
      includedProducts: [],
      includedCategories: [],
      customerGroups: [],
    })
    setShowAddDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`/api/coupons?id=${couponToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete coupon')

      toast.success('Coupon deleted successfully')
      setCoupons(coupons.filter(c => c.id !== couponToDelete.id))
      setShowDeleteDialog(false)
      setCouponToDelete(null)
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Failed to delete coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return

    try {
      const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCoupon),
      })

      if (!response.ok) throw new Error('Failed to update coupon')

      toast.success('Coupon updated successfully')
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? editingCoupon : c))
      setShowEditDialog(false)
      setEditingCoupon(null)
    } catch (error) {
      console.error('Error updating coupon:', error)
      toast.error('Failed to update coupon')
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCoupon),
      })

      if (!response.ok) throw new Error('Failed to create coupon')

      toast.success('Coupon created successfully')
      setCoupons(prevCoupons => [...prevCoupons, newCoupon as Coupon])
      setShowAddDialog(false)
      setNewCoupon({})
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast.error('Failed to create coupon')
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date()
    return (
      coupon.isActive &&
      new Date(coupon.startDate) <= now &&
      new Date(coupon.endDate) >= now &&
      (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Coupons
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage discount coupons and promotional codes
            </p>
          </div>
          <Button onClick={() => router.push('/admin/marketing/coupons/add')} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <FiPlus className="mr-2" />
            Add Coupon
          </Button>
        </div>

        <Card className="p-6 shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <FiLoader className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-500">Loading coupons...</span>
                </div>
              </div>
            ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Value</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Validity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No coupons found
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4">
                      <span className="font-mono font-medium">{coupon.code}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs truncate">{coupon.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={coupon.type === 'percentage' ? 'secondary' : 'default'}>
                        {coupon.type === 'percentage' ? (
                          <FiPercent className="mr-1" />
                        ) : (
                          <FiDollarSign className="mr-1" />
                        )}
                        {coupon.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {coupon.type === 'percentage' ? (
                        <span className="text-blue-600 dark:text-blue-400">{coupon.value}%</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">{formatCurrency(coupon.value)}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm">
                        <FiUsers className="mr-1" />
                        {coupon.usageCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-1" />
                        {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={isCouponActive(coupon) ? "default" : "destructive"}>
                        {isCouponActive(coupon) ? (
                          <FiCheckCircle className="mr-1" />
                        ) : (
                          <FiXCircle className="mr-1" />
                        )}
                        {isCouponActive(coupon) ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                              onClick={() => router.push(`/admin/marketing/coupons/${coupon.id}/view`)}
                              className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/marketing/coupons/${coupon.id}/edit`)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(coupon)}
                          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
            <div className="flex items-center space-x-2">
              <FiTag className="text-gray-500" />
              <span className="font-mono font-medium">{couponToDelete?.code}</span>
            </div>
            {couponToDelete?.description && (
              <p className="text-sm text-gray-500 mt-2">{couponToDelete.description}</p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update the coupon details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={editingCoupon?.code}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, code: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editingCoupon?.type}
                  onValueChange={(value) => setEditingCoupon(prev => prev ? { ...prev, type: value as 'percentage' | 'fixed' } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editingCoupon?.description}
                onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={editingCoupon?.value}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, value: parseInt(e.target.value) } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPurchaseAmount">Minimum Purchase Amount</Label>
                <Input
                  id="minPurchaseAmount"
                  type="number"
                  value={editingCoupon?.minPurchaseAmount || ''}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, minPurchaseAmount: parseInt(e.target.value) } : null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editingCoupon?.startDate.split('T')[0]}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editingCoupon?.endDate.split('T')[0]}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={editingCoupon?.usageLimit || ''}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, usageLimit: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perCustomerLimit">Per Customer Limit</Label>
                <Input
                  id="perCustomerLimit"
                  type="number"
                  value={editingCoupon?.perCustomerLimit || ''}
                  onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, perCustomerLimit: parseInt(e.target.value) } : null)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={editingCoupon?.isActive}
                  defaultChecked={editingCoupon?.isActive}
                  onClick={() => setEditingCoupon(prev => prev ? { ...prev, isActive: !prev.isActive } : null)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFirstTimeOnly"
                  checked={editingCoupon?.isFirstTimeOnly}
                  defaultChecked={editingCoupon?.isFirstTimeOnly}
                  onClick={() => setEditingCoupon(prev => prev ? { ...prev, isFirstTimeOnly: !prev.isFirstTimeOnly } : null)}
                />
                <Label htmlFor="isFirstTimeOnly">First Time Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isNewCustomerOnly"
                  checked={editingCoupon?.isNewCustomerOnly}
                  defaultChecked={editingCoupon?.isNewCustomerOnly}
                  onClick={() => setEditingCoupon(prev => prev ? { ...prev, isNewCustomerOnly: !prev.isNewCustomerOnly } : null)}
                />
                <Label htmlFor="isNewCustomerOnly">New Customers Only</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newCode">Code</Label>
                <Input
                  id="newCode"
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newType">Type</Label>
                <Select
                  value={newCoupon.type}
                  onValueChange={(value) => setNewCoupon(prev => ({ ...prev, type: value as 'percentage' | 'fixed' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDescription">Description</Label>
              <Input
                id="newDescription"
                value={newCoupon.description || ''}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newValue">Value</Label>
                <Input
                  id="newValue"
                  type="number"
                  value={newCoupon.value || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newMinPurchaseAmount">Minimum Purchase Amount</Label>
                <Input
                  id="newMinPurchaseAmount"
                  type="number"
                  value={newCoupon.minPurchaseAmount || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, minPurchaseAmount: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newStartDate">Start Date</Label>
                <Input
                  id="newStartDate"
                  type="date"
                  value={newCoupon.startDate || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEndDate">End Date</Label>
                <Input
                  id="newEndDate"
                  type="date"
                  value={newCoupon.endDate || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newUsageLimit">Usage Limit</Label>
                <Input
                  id="newUsageLimit"
                  type="number"
                  value={newCoupon.usageLimit || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPerCustomerLimit">Per Customer Limit</Label>
                <Input
                  id="newPerCustomerLimit"
                  type="number"
                  value={newCoupon.perCustomerLimit || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, perCustomerLimit: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="newIsActive"
                  checked={newCoupon.isActive}
                  defaultChecked={newCoupon.isActive}
                  onClick={() => setNewCoupon(prev => ({ ...prev, isActive: !prev.isActive }))}
                />
                <Label htmlFor="newIsActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="newIsFirstTimeOnly"
                  checked={newCoupon.isFirstTimeOnly}
                  defaultChecked={newCoupon.isFirstTimeOnly}
                  onClick={() => setNewCoupon(prev => ({ ...prev, isFirstTimeOnly: !prev.isFirstTimeOnly }))}
                />
                <Label htmlFor="newIsFirstTimeOnly">First Time Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="newIsNewCustomerOnly"
                  checked={newCoupon.isNewCustomerOnly}
                  defaultChecked={newCoupon.isNewCustomerOnly}
                  onClick={() => setNewCoupon(prev => ({ ...prev, isNewCustomerOnly: !prev.isNewCustomerOnly }))}
                />
                <Label htmlFor="newIsNewCustomerOnly">New Customers Only</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
