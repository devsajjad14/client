'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  FiArrowLeft,
  FiSave,
  FiLoader,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiTag,
  FiSettings,
} from 'react-icons/fi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { use } from 'react'

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
  perCustomerLimit: number | null
  isActive: boolean
  isFirstTimeOnly: boolean
  isNewCustomerOnly: boolean
  excludedProducts: string[]
  excludedCategories: string[]
  includedProducts: string[]
  includedCategories: string[]
  customerGroups: string[]
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const response = await fetch(`/api/coupons/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to load coupon')
        }
        const data = await response.json()
        setCoupon(data)
      } catch (error) {
        toast.error('Failed to load coupon')
        router.push('/admin/marketing/coupons')
      } finally {
        setLoading(false)
      }
    }

    loadCoupon()
  }, [resolvedParams.id, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupon) return

    setSaving(true)
    try {
      const response = await fetch(`/api/coupons/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...coupon,
          value: parseFloat(coupon.value.toString()),
          minPurchaseAmount: coupon.minPurchaseAmount ? parseFloat(coupon.minPurchaseAmount.toString()) : null,
          maxDiscountAmount: coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount.toString()) : null,
          usageLimit: coupon.usageLimit ? parseInt(coupon.usageLimit.toString()) : null,
          perCustomerLimit: coupon.perCustomerLimit ? parseInt(coupon.perCustomerLimit.toString()) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update coupon')
      }

      toast.success('Coupon updated successfully')
      router.push('/admin/marketing/coupons')
    } catch (error) {
      toast.error('Failed to update coupon')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <FiLoader className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading coupon...</span>
        </div>
      </div>
    )
  }

  if (!coupon) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Edit Coupon
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                Modify coupon details and settings
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
                <div className="flex items-center gap-2">
                  <FiTag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">Code</Label>
                    <Input
                      id="code"
                      value={coupon.code}
                      onChange={(e) => setCoupon({ ...coupon, code: e.target.value })}
                      required
                      className="h-11 bg-white dark:bg-gray-900"
                      placeholder="Enter coupon code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                    <Select
                      value={coupon.type}
                      onValueChange={(value) => setCoupon({ ...coupon, type: value as 'percentage' | 'fixed' })}
                    >
                      <SelectTrigger className="h-11 bg-white dark:bg-gray-900">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <FiPercent className="h-4 w-4" />
                            <span>Percentage Discount</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="h-4 w-4" />
                            <span>Fixed Amount</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Input
                    id="description"
                    value={coupon.description}
                    onChange={(e) => setCoupon({ ...coupon, description: e.target.value })}
                    className="h-11 bg-white dark:bg-gray-900"
                    placeholder="Enter coupon description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Discount Settings */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
                <div className="flex items-center gap-2">
                  <FiSettings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold">Discount Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="value" className="text-sm font-medium">Value</Label>
                    <div className="relative">
                      <Input
                        id="value"
                        type="number"
                        value={coupon.value}
                        onChange={(e) => setCoupon({ ...coupon, value: parseFloat(e.target.value) })}
                        required
                        className="h-11 bg-white dark:bg-gray-900 pl-8"
                        placeholder={coupon.type === 'percentage' ? 'Enter percentage' : 'Enter amount in cents'}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {coupon.type === 'percentage' ? <FiPercent className="h-4 w-4" /> : <FiDollarSign className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minPurchaseAmount" className="text-sm font-medium">Minimum Purchase Amount</Label>
                    <div className="relative">
                      <Input
                        id="minPurchaseAmount"
                        type="number"
                        value={coupon.minPurchaseAmount || ''}
                        onChange={(e) => setCoupon({ ...coupon, minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : null })}
                        className="h-11 bg-white dark:bg-gray-900 pl-8"
                        placeholder="Enter minimum amount in cents"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <FiDollarSign className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount" className="text-sm font-medium">Maximum Discount Amount</Label>
                    <div className="relative">
                      <Input
                        id="maxDiscountAmount"
                        type="number"
                        value={coupon.maxDiscountAmount || ''}
                        onChange={(e) => setCoupon({ ...coupon, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null })}
                        className="h-11 bg-white dark:bg-gray-900 pl-8"
                        placeholder="Enter maximum amount in cents"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <FiDollarSign className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validity & Usage */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold">Validity & Usage</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={coupon.startDate.split('T')[0]}
                      onChange={(e) => setCoupon({ ...coupon, startDate: e.target.value })}
                      required
                      className="h-11 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={coupon.endDate.split('T')[0]}
                      onChange={(e) => setCoupon({ ...coupon, endDate: e.target.value })}
                      required
                      className="h-11 bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit" className="text-sm font-medium">Usage Limit</Label>
                    <div className="relative">
                      <Input
                        id="usageLimit"
                        type="number"
                        value={coupon.usageLimit || ''}
                        onChange={(e) => setCoupon({ ...coupon, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                        className="h-11 bg-white dark:bg-gray-900 pl-8"
                        placeholder="Enter total usage limit"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <FiUsers className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perCustomerLimit" className="text-sm font-medium">Per Customer Limit</Label>
                    <div className="relative">
                      <Input
                        id="perCustomerLimit"
                        type="number"
                        value={coupon.perCustomerLimit || ''}
                        onChange={(e) => setCoupon({ ...coupon, perCustomerLimit: e.target.value ? parseInt(e.target.value) : null })}
                        className="h-11 bg-white dark:bg-gray-900 pl-8"
                        placeholder="Enter per-customer limit"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <FiUsers className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restrictions */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
                <div className="flex items-center gap-2">
                  <FiUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold">Restrictions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Switch
                      id="isActive"
                      checked={coupon.isActive}
                      onChange={(e) => setCoupon({ ...coupon, isActive: e.target.checked })}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="isActive" className="ml-3 font-medium">Active</Label>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Switch
                      id="isFirstTimeOnly"
                      checked={coupon.isFirstTimeOnly}
                      onChange={(e) => setCoupon({ ...coupon, isFirstTimeOnly: e.target.checked })}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="isFirstTimeOnly" className="ml-3 font-medium">First Time Customers Only</Label>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Switch
                      id="isNewCustomerOnly"
                      checked={coupon.isNewCustomerOnly}
                      onChange={(e) => setCoupon({ ...coupon, isNewCustomerOnly: e.target.checked })}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="isNewCustomerOnly" className="ml-3 font-medium">New Customers Only</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving && <FiLoader className="h-4 w-4 animate-spin mr-2" />}
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 