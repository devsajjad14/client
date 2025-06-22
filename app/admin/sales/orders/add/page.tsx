'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiArrowLeft, FiPlus, FiTrash2, FiSearch, FiShoppingCart, FiUser, FiCreditCard } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Product = {
  id: string
  name: string
  regular_price: number
  selling_price: number | null
  image: string
  stock: number
  style: string
  brand: string | null
  styleId: number
}

type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

type Customer = {
  id: string
  name: string | null
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  billingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
  shippingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export default function AddOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    shippingAddress: '',
    paymentMethod: 'cash',
    status: 'paid',
    note: '',
    discountType: 'amount',
    discountValue: '',
    taxAmount: '0',
    shippingAmount: '',
    phone: '',
    billingAddress: '',
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedCustomerSearch = useDebounce(customerSearch, 300)

  // Only fetch products when there's a search query
  useEffect(() => {
    if (debouncedSearch) {
      fetchProducts()
    } else {
      setProducts([]) // Clear products when search is empty
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (debouncedCustomerSearch) {
      fetchCustomers()
    } else {
      setCustomers([])
    }
  }, [debouncedCustomerSearch])

  const fetchProducts = async () => {
    try {
      setIsSearching(true)
      console.log('Fetching products with search:', debouncedSearch)
      const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch products')
      }
      
      const data = await response.json()
      console.log('Raw API Response:', JSON.stringify(data, null, 2))
      
      // Log each product's price details
      data.forEach((product: Product) => {
        console.log('Product price details:', {
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
          regular_price: product.regular_price,
          selling_price_type: typeof product.selling_price,
          regular_price_type: typeof product.regular_price,
          selling_price_raw: product.selling_price,
          regular_price_raw: product.regular_price
        })
      })
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load products')
      setProducts([]) // Clear products on error
    } finally {
      setIsSearching(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      setIsSearching(true)
      console.log('Fetching customers with search:', debouncedCustomerSearch)
      const response = await fetch(`/api/customers?search=${encodeURIComponent(debouncedCustomerSearch)}`)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('API Error:', data)
        throw new Error(data.error || 'Failed to fetch customers')
      }
      
      console.log('Fetched customers:', data)
      setCustomers(data.customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load customers')
      setCustomers([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProduct = (product: Product) => {
    console.log('Adding product - Full product data:', JSON.stringify(product, null, 2))
    
    // Convert prices to numbers and ensure we have a valid value
    const sellingPrice = parseFloat(String(product.selling_price))
    const regularPrice = parseFloat(String(product.regular_price))
    
    console.log('Price conversion:', {
      selling_price_original: product.selling_price,
      regular_price_original: product.regular_price,
      selling_price_converted: sellingPrice,
      regular_price_converted: regularPrice,
      selling_price_is_valid: !isNaN(sellingPrice),
      regular_price_is_valid: !isNaN(regularPrice)
    })
    
    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // Use selling_price if it's a valid number, otherwise use regular_price
      const price = !isNaN(sellingPrice) && sellingPrice > 0 ? sellingPrice : regularPrice
      
      console.log('Final price selection:', {
        selling_price: sellingPrice,
        regular_price: regularPrice,
        selected_price: price,
        price_type: typeof price
      })
      
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: price,
        image: product.image
      }])
    }
    toast.success(`${product.name} added to order`)
    setSearchQuery('') // Clear search after adding product
    setProducts([]) // Clear products list
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setOrderItems(orderItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ))
  }

  const handleQuantityInput = (productId: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return
    handleQuantityChange(productId, quantity)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if the click came from a tab
    const target = e.target as HTMLElement
    if (target.closest('[role="tab"]')) {
      return
    }
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one product to the order')
      return
    }
    
    setIsLoading(true)

    try {
      // If a customer is selected, get their ID
      let userId = null
      if (selectedCustomer) {
        userId = selectedCustomer.id
      } else if (formData.customerEmail) {
        const userResponse = await fetch(`/api/users/search?email=${encodeURIComponent(formData.customerEmail)}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData && userData.length > 0) {
            userId = userData[0].id
          }
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: orderItems,
          userId,
          // Set payment status based on payment method
          paymentStatus: formData.paymentMethod === 'cash' ? 'paid' : 'unpaid',
        }),
      })

      if (!response.ok) throw new Error('Failed to create order')

      toast.success('Order created successfully')
      router.push('/admin/sales/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    if (formData.discountType === 'percentage') {
      const percentage = parseFloat(formData.discountValue) || 0
      return (subtotal * percentage) / 100
    }
    return parseFloat(formData.discountValue) || 0
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemPrice = parseFloat(String(item.price))
      const itemQuantity = parseInt(String(item.quantity))
      const subtotal = !isNaN(itemPrice) && !isNaN(itemQuantity) ? itemPrice * itemQuantity : 0
      return sum + subtotal
    }, 0)
  }

  const calculateTax = () => {
    return parseFloat(formData.taxAmount) || 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    const shipping = parseFloat(formData.shippingAmount) || 0
    return subtotal - discount + tax + shipping
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email)
    setShowCustomerDropdown(false)
    setFormData(prev => ({
      ...prev,
      customerEmail: customer.email,
      customerName: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
      shippingAddress: formatAddress(customer.shippingAddress),
      billingAddress: formatAddress(customer.billingAddress),
      phone: customer.phone || ''
    }))
  }

  const formatAddress = (address: Customer['shippingAddress']) => {
    if (!address || !address.street) return ''
    const parts = [
      address.street,
      address.street2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country
    ].filter(Boolean)
    return parts.join('\n')
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add products and complete order details
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Product Selection and Details */}
          <div className="col-span-8 space-y-6">
            {/* Product Selection Section */}
            <Card className="p-6">
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Select Products</h2>
                
                <div className="relative w-full">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or style ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="pl-9 w-full"
                  />
                  {showDropdown && searchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                      {isSearching ? (
                        <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                          <span>Searching products...</span>
                        </div>
                      ) : products.length > 0 ? (
                        products.map((product) => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                            onClick={() => {
                              handleAddProduct(product)
                              setShowDropdown(false)
                            }}
                          >
                            <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                Style: {product.style} {product.styleId && `(ID: ${product.styleId})`}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {(() => {
                                const sellingPrice = parseFloat(String(product.selling_price))
                                const regularPrice = parseFloat(String(product.regular_price))
                                const price = !isNaN(sellingPrice) && sellingPrice > 0 ? sellingPrice : regularPrice
                                
                                console.log('Display price calculation:', {
                                  product_id: product.id,
                                  selling_price_original: product.selling_price,
                                  regular_price_original: product.regular_price,
                                  selling_price_converted: sellingPrice,
                                  regular_price_converted: regularPrice,
                                  final_price: price,
                                  price_type: typeof price
                                })
                                return `$${price}`
                              })()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    Start typing in the search box to find products
                  </div>
                )}
              </div>
            </Card>

            {/* Order Details and Customer Section */}
            <div onClick={(e) => e.stopPropagation()}>
              <div onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}>
                <Tabs defaultValue="order" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="order" className="flex items-center gap-2">
                      <FiCreditCard className="h-4 w-4" />
                      Order Details
                    </TabsTrigger>
                    <TabsTrigger value="customer" className="flex items-center gap-2">
                      <FiUser className="h-4 w-4" />
                      Customer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="order" className="space-y-4">
                    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">Payment Method</Label>
                          <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => {
                              setFormData((prev) => ({
                                ...prev,
                                paymentMethod: value,
                                status: value === 'cash' ? 'paid' : prev.status
                              }))
                            }}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                            disabled={formData.paymentMethod === 'cash'}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Discount Section */}
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-700">Discount</h3>
                          <div className="flex items-center gap-2">
                            <Select
                              value={formData.discountType}
                              onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                            >
                              <SelectTrigger className="h-8 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="percentage">Percentage</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                {formData.discountType === 'percentage' ? '%' : '$'}
                              </span>
                              <Input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                className="h-8 w-32 pl-8"
                                placeholder="0.00"
                                min="0"
                                max={formData.discountType === 'percentage' ? "100" : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tax Section */}
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-700">Tax Amount</h3>
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              value={formData.taxAmount}
                              onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                              className="h-8 pl-8"
                              placeholder="0.00"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Shipping Section */}
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-700">Shipping Amount</h3>
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              value={formData.shippingAmount}
                              onChange={(e) => setFormData({ ...formData, shippingAmount: e.target.value })}
                              className="h-8 pl-8"
                              placeholder="0.00"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Label htmlFor="note" className="text-sm font-medium text-gray-700">Order Note</Label>
                        <Textarea
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          placeholder="Add any additional notes about this order"
                          className="mt-2 h-24 resize-none"
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="customer" className="mt-4">
                    <Card className="p-6">
                      <div className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <Card>
                            <div className="p-6 space-y-4">
                              <h2 className="text-lg font-semibold">Customer Information</h2>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Search Customer</Label>
                                  <div className="relative">
                                    <div className="relative">
                                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                      <Input
                                        placeholder="Search customers by name, email, or phone..."
                                        value={customerSearch}
                                        onChange={(e) => {
                                          setCustomerSearch(e.target.value)
                                          setShowCustomerDropdown(true)
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        className="w-full pl-9"
                                        autoComplete="off"
                                        type="search"
                                      />
                                      {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {showCustomerDropdown && customerSearch && (
                                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                                        {customers.length > 0 ? (
                                          customers.map((customer) => (
                                            <div
                                              key={customer.id}
                                              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                              onClick={() => handleCustomerSelect(customer)}
                                            >
                                              <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                  <div className="font-medium text-gray-900">
                                                    {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email}
                                                  </div>
                                                  <div className="text-sm text-gray-500 space-y-1 mt-1">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-gray-400">Email:</span>
                                                      <span>{customer.email}</span>
                                                    </div>
                                                    {customer.phone && (
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-gray-400">Phone:</span>
                                                        <span>{customer.phone}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    {customer.name?.[0] || customer.firstName?.[0] || customer.lastName?.[0] || customer.email[0].toUpperCase()}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-6 text-center">
                                            {isSearching ? (
                                              <div className="flex flex-col items-center gap-2">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                                <span className="text-sm text-gray-500">Searching customers...</span>
                                              </div>
                                            ) : (
                                              <div className="text-gray-500">
                                                <div className="text-sm font-medium mb-1">No customers found</div>
                                                <div className="text-xs">Try searching with a different term</div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    placeholder="Customer email"
                                    readOnly
                                    disabled
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="Customer name"
                                    readOnly
                                    disabled
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Phone</Label>
                                  <Input
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Customer phone"
                                    readOnly
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                          <Card>
                            <div className="p-6 space-y-4">
                              <h2 className="text-lg font-semibold">Addresses</h2>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Billing Address</Label>
                                  <Textarea
                                    value={formData.billingAddress || ''}
                                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                                    placeholder="Enter billing address"
                                    className="h-32"
                                    readOnly
                                    disabled
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Shipping Address</Label>
                                  <Textarea
                                    value={formData.shippingAddress}
                                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    placeholder="Enter shipping address"
                                    className="h-32"
                                    readOnly
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-span-4 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex flex-col p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 truncate">{item.productName}</h3>
                            <p className="font-medium text-gray-900 ml-4 flex-shrink-0">
                              {(() => {
                                const total = (item.price || 0) * item.quantity
                                console.log('Item total:', {
                                  price: item.price,
                                  quantity: item.quantity,
                                  total: total
                                })
                                return `$${total}`
                              })()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityInput(item.productId, e.target.value)}
                              className="w-16 h-8 text-center"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors w-full"
                        >
                          Remove Item
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                {parseFloat(formData.shippingAmount) > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${parseFloat(formData.shippingAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              disabled={isLoading || orderItems.length === 0}
              className="w-full h-24 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating Order...
                </>
              ) : (
                <>
                  <FiShoppingCart className="h-6 w-6" />
                  Create Order
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 