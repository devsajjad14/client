'use client'

import { useState, useEffect, use } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FiArrowLeft, FiSave, FiUser, FiLoader } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  billingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  shippingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    shippingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  })

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/customers/${resolvedParams.id}`)
        
        if (!response.ok) {
          const errorData = await response.text()
          let errorMessage = 'Failed to fetch customer'
          try {
            const parsed = JSON.parse(errorData)
            errorMessage = parsed.error || errorMessage
          } catch (e) {
            // If JSON parsing fails, use the raw text
            errorMessage = errorData || errorMessage
          }
          throw new Error(errorMessage)
        }

        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from server')
        }

        const data = JSON.parse(text)
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format')
        }
        
        setCustomer({
          id: data.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email,
          phone: data.phone || '',
          billingAddress: data.billingAddress || {
            street: '',
            street2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
          shippingAddress: data.shippingAddress || {
            street: '',
            street2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
        })
      } catch (error) {
        console.error('Error loading customer:', error)
        toast.error('Failed to load customer')
        router.push('/admin/sales/customers')
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomer()
  }, [resolvedParams.id, router])

  const handleUpdateCustomer = async () => {
    // Validate required fields
    if (!customer.firstName || !customer.lastName || !customer.email) {
      toast.error('First name, last name, and email are required')
      return
    }

    try {
      setIsSubmitting(true)
      // Ensure addresses are properly set
      const customerData = {
        ...customer,
        billingAddress: customer.billingAddress?.street ? customer.billingAddress : null,
        shippingAddress: customer.shippingAddress?.street ? customer.shippingAddress : null,
      }

      const response = await fetch(`/api/customers/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
      }

      toast.success('Customer updated successfully')
      router.push('/admin/sales/customers')
    } catch (error: any) {
      console.error('Error updating customer:', error)
      toast.error(error.message || 'Failed to update customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-500">
          <FiLoader className="h-5 w-5 animate-spin" />
          Loading customer data...
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update customer information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateCustomer}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={customer.firstName}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="First name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customer.lastName}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customer.phone || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Billing Address */}
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billingStreet">Street Address</Label>
                <Input
                  id="billingStreet"
                  value={customer.billingAddress?.street || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress!,
                        street: e.target.value,
                      },
                    }))
                  }
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingStreet2">Street Address 2</Label>
                <Input
                  id="billingStreet2"
                  value={customer.billingAddress?.street2 || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress!,
                        street2: e.target.value,
                      },
                    }))
                  }
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  value={customer.billingAddress?.city || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress!,
                        city: e.target.value,
                      },
                    }))
                  }
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingState">State</Label>
                <Input
                  id="billingState"
                  value={customer.billingAddress?.state || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress!,
                        state: e.target.value,
                      },
                    }))
                  }
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingPostalCode">Postal Code</Label>
                <Input
                  id="billingPostalCode"
                  value={customer.billingAddress?.postalCode || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress!,
                        postalCode: e.target.value,
                      },
                    }))
                  }
                  placeholder="Postal code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCountry">Country</Label>
                <Input
                  id="billingCountry"
                  value={customer.billingAddress?.country || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress!,
                        country: e.target.value,
                      },
                    }))
                  }
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shippingStreet">Street Address</Label>
                <Input
                  id="shippingStreet"
                  value={customer.shippingAddress?.street || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      shippingAddress: {
                        ...prev.shippingAddress!,
                        street: e.target.value,
                      },
                    }))
                  }
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingStreet2">Street Address 2</Label>
                <Input
                  id="shippingStreet2"
                  value={customer.shippingAddress?.street2 || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      shippingAddress: {
                        ...prev.shippingAddress!,
                        street2: e.target.value,
                      },
                    }))
                  }
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  value={customer.shippingAddress?.city || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      shippingAddress: {
                        ...prev.shippingAddress!,
                        city: e.target.value,
                      },
                    }))
                  }
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingState">State</Label>
                <Input
                  id="shippingState"
                  value={customer.shippingAddress?.state || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      shippingAddress: {
                        ...prev.shippingAddress!,
                        state: e.target.value,
                      },
                    }))
                  }
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingPostalCode">Postal Code</Label>
                <Input
                  id="shippingPostalCode"
                  value={customer.shippingAddress?.postalCode || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      shippingAddress: {
                        ...prev.shippingAddress!,
                        postalCode: e.target.value,
                      },
                    }))
                  }
                  placeholder="Postal code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCountry">Country</Label>
                <Input
                  id="shippingCountry"
                  value={customer.shippingAddress?.country || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      shippingAddress: {
                        ...prev.shippingAddress!,
                        country: e.target.value,
                      },
                    }))
                  }
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 