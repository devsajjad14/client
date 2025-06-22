'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiTrash2, FiSearch, FiRefreshCw, FiEdit2, FiEye, FiUser, FiDollarSign, FiShoppingBag, FiMail, FiX, FiSettings, FiCreditCard, FiTruck, FiLoader } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface User {
  id: string
  name: string
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

const Modal = memo(({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-3xl my-8 p-6 text-left align-middle bg-white rounded-lg shadow-xl transform transition-all relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
})
Modal.displayName = 'Modal'

const CustomerDetailsContent = memo(({ user }: { user: User }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Customer Details</h2>
      
      {/* Customer Overview */}
      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <FiUser className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FiMail className="h-4 w-4" />
              {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1">
                <span>•</span>
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
              <FiCreditCard className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-medium text-gray-900">Billing Address</h4>
          </div>
          <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200/50">
            {user.billingAddress ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-900">{user.billingAddress.street}</p>
                {user.billingAddress.street2 && (
                  <p className="text-sm text-gray-900">{user.billingAddress.street2}</p>
                )}
                <p className="text-sm text-gray-900">
                  {user.billingAddress.city}, {user.billingAddress.state} {user.billingAddress.postalCode}
                </p>
                <p className="text-sm text-gray-900">{user.billingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No billing address provided</p>
            )}
          </Card>
        </div>

        {/* Shipping Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
              <FiTruck className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-medium text-gray-900">Shipping Address</h4>
          </div>
          <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200/50">
            {user.shippingAddress ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-900">{user.shippingAddress.street}</p>
                {user.shippingAddress.street2 && (
                  <p className="text-sm text-gray-900">{user.shippingAddress.street2}</p>
                )}
                <p className="text-sm text-gray-900">
                  {user.shippingAddress.city}, {user.shippingAddress.state} {user.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-gray-900">{user.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No shipping address provided</p>
            )}
          </Card>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Customer ID</p>
            <p className="mt-1 text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
CustomerDetailsContent.displayName = 'CustomerDetailsContent'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isViewLoading, setIsViewLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/customers${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setUsers(data.customers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/customers?id=${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete customer')
        toast.success('User deleted successfully')
        loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  const handleViewUser = useCallback(async (user: User) => {
    setIsViewLoading(true)
    setIsViewDialogOpen(true)
    // Simulate loading time for modal preparation
    await new Promise(resolve => setTimeout(resolve, 100))
    setSelectedUser(user)
    setIsViewLoading(false)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsViewDialogOpen(false)
    // Clear selected user after animation completes
    setTimeout(() => setSelectedUser(null), 300)
  }, [])

  const handleEditUser = (user: User) => {
    router.push(`/admin/sales/customers/${user.id}/edit`)
  }

  // Calculate overview statistics
  const totalUsers = users.length
  const usersWithAddresses = users.filter(u => u.billingAddress || u.shippingAddress).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your customer accounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
            onClick={() => router.push('/admin/sales/customers/add')}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalUsers}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Customers with Addresses
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {usersWithAddresses}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FiMail className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Customer List */}
        <div className="col-span-12 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </form>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadUsers}
                  disabled={isLoading}
                >
                  <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-16 bg-gray-100 rounded-lg flex items-center px-4">
                          <div className="space-y-3 flex-1 grid grid-cols-5 gap-4">
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="flex justify-end gap-2">
                              <div className="h-8 w-8 bg-gray-200 rounded"></div>
                              <div className="h-8 w-8 bg-gray-200 rounded"></div>
                              <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No customers found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-500">{user.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{user.phone || '-'}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewUser(user)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                                >
                                  <FiEye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(user.id)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {typeof window !== 'undefined' && (
        <Modal isOpen={isViewDialogOpen} onClose={handleCloseDialog}>
          {isViewLoading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <FiLoader className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500">Loading customer details...</p>
              </div>
            </div>
          ) : selectedUser ? (
            <CustomerDetailsContent user={selectedUser} />
          ) : null}
        </Modal>
      )}
    </div>
  )
}
