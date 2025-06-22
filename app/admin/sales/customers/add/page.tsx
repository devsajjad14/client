'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiUser, FiMail, FiCreditCard, FiTruck, FiLoader, FiSettings } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AddCustomerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  })

  const handleAddCustomer = async () => {
    // Validate required fields
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      toast.error('First name, last name, and email are required')
      return
    }

    try {
      setIsSubmitting(true)
      // Ensure addresses are properly set
      const customerData = {
        ...newCustomer,
        billingAddress: newCustomer.billingAddress.street ? newCustomer.billingAddress : null,
        shippingAddress: newCustomer.shippingAddress.street ? newCustomer.shippingAddress : null,
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create customer')
      }

      toast.success('Customer added successfully')
      router.push('/admin/sales/customers')
    } catch (error: any) {
      console.error('Error adding customer:', error)
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Error Adding Customer</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new customer account
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCustomer}
            disabled={isSubmitting}
            className="h-10 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Add Customer'
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <FiUser className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-sm font-medium">Basic Information</h4>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name *
                  </label>
                  <Input
                    value={newCustomer.firstName}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="First name"
                    className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name *
                  </label>
                  <Input
                    value={newCustomer.lastName}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Last name"
                    className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Email address"
                    className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Phone number"
                    className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8">
          {/* Billing Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                <FiCreditCard className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-sm font-medium">Billing Address</h4>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Street Address
                  </label>
                  <Input
                    value={newCustomer.billingAddress.street}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        billingAddress: {
                          ...prev.billingAddress,
                          street: e.target.value,
                        },
                      }))
                    }
                    placeholder="Street address"
                    className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <Input
                      value={newCustomer.billingAddress.city}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                      placeholder="City"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <Input
                      value={newCustomer.billingAddress.state}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            state: e.target.value,
                          },
                        }))
                      }
                      placeholder="State"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Postal Code
                    </label>
                    <Input
                      value={newCustomer.billingAddress.postalCode}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                      placeholder="Postal code"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <Input
                      value={newCustomer.billingAddress.country}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            country: e.target.value,
                          },
                        }))
                      }
                      placeholder="Country"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <FiTruck className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-sm font-medium">Shipping Address</h4>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Street Address
                  </label>
                  <Input
                    value={newCustomer.shippingAddress.street}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        shippingAddress: {
                          ...prev.shippingAddress,
                          street: e.target.value,
                        },
                      }))
                    }
                    placeholder="Street address"
                    className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <Input
                      value={newCustomer.shippingAddress.city}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                      placeholder="City"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <Input
                      value={newCustomer.shippingAddress.state}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            state: e.target.value,
                          },
                        }))
                      }
                      placeholder="State"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Postal Code
                    </label>
                    <Input
                      value={newCustomer.shippingAddress.postalCode}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                      placeholder="Postal code"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <Input
                      value={newCustomer.shippingAddress.country}
                      onChange={(e) =>
                        setNewCustomer((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            country: e.target.value,
                          },
                        }))
                      }
                      placeholder="Country"
                      className="w-full h-10 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 