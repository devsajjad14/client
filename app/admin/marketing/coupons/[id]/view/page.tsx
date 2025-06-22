'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  FiArrowLeft,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
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

export default function ViewCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <FiLoader className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading coupon details...</span>
        </div>
      </div>
    )
  }

  if (!coupon) {
    return null
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
              <h1 className="text-2xl font-bold">View Coupon</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View coupon details
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/marketing/coupons/${resolvedParams.id}/edit`)}
              className="gap-2"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this coupon?')) {
                  fetch(`/api/coupons/${resolvedParams.id}`, { method: 'DELETE' })
                    .then(() => {
                      toast.success('Coupon deleted successfully')
                      router.push('/admin/marketing/coupons')
                    })
                    .catch(() => {
                      toast.error('Failed to delete coupon')
                    })
                }
              }}
              className="gap-2"
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg font-semibold">Coupon Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Code</div>
                  <div className="font-mono text-lg">{coupon.code}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                  <Badge variant={coupon.isActive ? "default" : "destructive"}>
                    {coupon.isActive ? (
                      <FiCheckCircle className="mr-1" />
                    ) : (
                      <FiXCircle className="mr-1" />
                    )}
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                <div>{coupon.description || 'No description provided'}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Type</div>
                  <Badge variant="secondary">
                    {coupon.type === 'percentage' ? (
                      <FiPercent className="mr-1" />
                    ) : (
                      <FiDollarSign className="mr-1" />
                    )}
                    {coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Value</div>
                  <div className="text-lg font-medium">
                    {coupon.type === 'percentage' ? (
                      <span className="text-blue-600">{coupon.value}%</span>
                    ) : (
                      <span className="text-green-600">{formatCurrency(coupon.value)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Valid From</div>
                  <div>{formatDate(coupon.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Valid Until</div>
                  <div>{formatDate(coupon.endDate)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Usage Limit</div>
                  <div>{coupon.usageLimit ? `${coupon.usageLimit} uses` : 'No limit'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Per Customer Limit</div>
                  <div>{coupon.perCustomerLimit ? `${coupon.perCustomerLimit} uses per customer` : 'No limit'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Minimum Purchase Amount</div>
                  <div>{coupon.minPurchaseAmount ? formatCurrency(coupon.minPurchaseAmount) : 'No minimum'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Maximum Discount Amount</div>
                  <div>{coupon.maxDiscountAmount ? formatCurrency(coupon.maxDiscountAmount) : 'No maximum'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Customer Restrictions</div>
                  <div className="space-x-2">
                    {coupon.isFirstTimeOnly && (
                      <Badge variant="secondary">First Time Customers Only</Badge>
                    )}
                    {coupon.isNewCustomerOnly && (
                      <Badge variant="secondary">New Customers Only</Badge>
                    )}
                    {!coupon.isFirstTimeOnly && !coupon.isNewCustomerOnly && 'No customer restrictions'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Product Restrictions</div>
                  <div className="space-y-2">
                    {coupon.includedProducts.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Included Products:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {coupon.includedProducts.map(id => (
                            <Badge key={id} variant="outline">{id}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {coupon.excludedProducts.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Excluded Products:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {coupon.excludedProducts.map(id => (
                            <Badge key={id} variant="outline" className="border-red-200">{id}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {coupon.includedProducts.length === 0 && coupon.excludedProducts.length === 0 && 'No product restrictions'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Category Restrictions</div>
                  <div className="space-y-2">
                    {coupon.includedCategories.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Included Categories:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {coupon.includedCategories.map(id => (
                            <Badge key={id} variant="outline">{id}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {coupon.excludedCategories.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Excluded Categories:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {coupon.excludedCategories.map(id => (
                            <Badge key={id} variant="outline" className="border-red-200">{id}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {coupon.includedCategories.length === 0 && coupon.excludedCategories.length === 0 && 'No category restrictions'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 