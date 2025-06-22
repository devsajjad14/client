'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { FiArrowLeft, FiPercent, FiDollarSign, FiCalendar, FiUsers, FiTag } from 'react-icons/fi'

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perCustomerLimit: '',
    isActive: true,
    isFirstTimeOnly: false,
    isNewCustomerOnly: false,
  })

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const response = await fetch(`/api/coupons/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to load coupon')
        }
        const data = await response.json()
        
        // Format dates for datetime-local input
        const startDate = new Date(data.startDate).toISOString().slice(0, 16)
        const endDate = new Date(data.endDate).toISOString().slice(0, 16)
        
        setFormData({
          ...data,
          startDate,
          endDate,
          value: data.value.toString(),
          minPurchaseAmount: data.minPurchaseAmount?.toString() || '',
          maxDiscountAmount: data.maxDiscountAmount?.toString() || '',
          usageLimit: data.usageLimit?.toString() || '',
          perCustomerLimit: data.perCustomerLimit?.toString() || '',
        })
      } catch (error) {
        toast.error('Failed to load coupon')
        router.push('/admin/marketing/coupons')
      } finally {
        setInitialLoading(false)
      }
    }

    loadCoupon()
  }, [resolvedParams.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/coupons/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: parseInt(formData.value),
          minPurchaseAmount: formData.minPurchaseAmount ? parseInt(formData.minPurchaseAmount) : null,
          maxDiscountAmount: formData.maxDiscountAmount ? parseInt(formData.maxDiscountAmount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          perCustomerLimit: formData.perCustomerLimit ? parseInt(formData.perCustomerLimit) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update coupon')
      }

      toast.success('Coupon updated successfully')
      router.push('/admin/marketing/coupons')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading coupon data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Coupon</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Modify existing coupon details
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="coupon-form"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="code" className="text-sm font-medium mb-1.5 block">Coupon Code</Label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      placeholder="Enter coupon code"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium mb-1.5 block">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-semibold">Discount Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium mb-1.5 block">Discount Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-11 px-3 border rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="value" className="text-sm font-medium mb-1.5 block">
                    {formData.type === 'percentage' ? 'Percentage' : 'Amount'}
                  </Label>
                  <div className="relative">
                    {formData.type === 'percentage' ? (
                      <FiPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    ) : (
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      required
                      min="0"
                      max={formData.type === 'percentage' ? "100" : undefined}
                      placeholder={formData.type === 'percentage' ? "Enter percentage (0-100)" : "Enter amount"}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="minPurchaseAmount" className="text-sm font-medium mb-1.5 block">Minimum Purchase Amount</Label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="minPurchaseAmount"
                      name="minPurchaseAmount"
                      type="number"
                      value={formData.minPurchaseAmount}
                      onChange={handleChange}
                      min="0"
                      placeholder="Enter minimum purchase amount"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxDiscountAmount" className="text-sm font-medium mb-1.5 block">Maximum Discount Amount</Label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={handleChange}
                      min="0"
                      placeholder="Enter maximum discount amount"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-semibold">Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium mb-1.5 block">Start Date</Label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium mb-1.5 block">End Date</Label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-semibold">Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="usageLimit" className="text-sm font-medium mb-1.5 block">Total Usage Limit</Label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="usageLimit"
                      name="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      min="0"
                      placeholder="Enter total usage limit"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="perCustomerLimit" className="text-sm font-medium mb-1.5 block">Per Customer Limit</Label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="perCustomerLimit"
                      name="perCustomerLimit"
                      type="number"
                      value={formData.perCustomerLimit}
                      onChange={handleChange}
                      min="0"
                      placeholder="Enter per customer usage limit"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive" className="text-sm font-medium mb-1.5 block">Active Status</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable this coupon</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isFirstTimeOnly" className="text-sm font-medium mb-1.5 block">First Time Only</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Restrict to first-time customers</p>
                  </div>
                  <Switch
                    id="isFirstTimeOnly"
                    checked={formData.isFirstTimeOnly}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFirstTimeOnly: e.target.checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isNewCustomerOnly" className="text-sm font-medium mb-1.5 block">New Customers Only</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Restrict to new customers only</p>
                  </div>
                  <Switch
                    id="isNewCustomerOnly"
                    checked={formData.isNewCustomerOnly}
                    onChange={(e) => setFormData(prev => ({ ...prev, isNewCustomerOnly: e.target.checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
} 