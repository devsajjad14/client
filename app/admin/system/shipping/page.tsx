'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiTruck,
  FiCheck,
  FiXCircle,
} from 'react-icons/fi'
import { toast } from 'sonner'

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  price: string | number
  estimatedDays: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ShippingMethodFormData {
  name: string
  description: string
  price: string
  estimatedDays: string
  isActive: boolean
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  method: ShippingMethod | null
  onUpdate: (data: Partial<ShippingMethod>) => Promise<void>
  isUpdating: boolean
}

const EditModal = ({ isOpen, onClose, method, onUpdate, isUpdating }: EditModalProps) => {
  const [formData, setFormData] = useState<Partial<ShippingMethod>>({
    name: '',
    description: '',
    price: 0,
    estimatedDays: 0,
    isActive: true,
  })

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name,
        description: method.description || '',
        price: method.price,
        estimatedDays: method.estimatedDays,
        isActive: method.isActive,
      })
    }
  }, [method])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl'
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              Edit Shipping Method
            </h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            >
              <FiX className='h-5 w-5' />
            </Button>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Name <span className='text-red-500'>*</span>
              </label>
              <Input
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder='Enter name'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Price <span className='text-red-500'>*</span>
              </label>
              <Input
                name="price"
                type='number'
                step='0.01'
                min='0'
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder='Enter price'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Estimated Days <span className='text-red-500'>*</span>
              </label>
              <Input
                name="estimatedDays"
                type='number'
                min='1'
                value={formData.estimatedDays || ''}
                onChange={handleInputChange}
                placeholder='Enter estimated days'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={handleInputChange}
                className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
              >
                <option value='true'>Active</option>
                <option value='false'>Inactive</option>
              </select>
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Description
              </label>
              <Input
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder='Enter description'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>
          </div>

          <div className='flex justify-end gap-4 mt-8'>
            <Button
              variant='outline'
              onClick={onClose}
              className='h-12 px-8 border-gray-200 dark:border-gray-700'
            >
              Cancel
            </Button>
            <Button
              onClick={() => onUpdate(formData)}
              disabled={isUpdating}
              className='h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            >
              {isUpdating ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Method'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ShippingPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<ShippingMethod>>({
    name: '',
    description: '',
    price: 0,
    estimatedDays: 0,
    isActive: true,
  })
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState<ShippingMethodFormData>({
    name: '',
    description: '',
    price: '',
    estimatedDays: '',
    isActive: true,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    try {
      const response = await fetch('/api/admin/shipping')
      if (!response.ok) throw new Error('Failed to fetch shipping methods')
      const data = await response.json()
      setMethods(data)
    } catch (error) {
      console.error('Error fetching shipping methods:', error)
      toast.error('Failed to fetch shipping methods')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.price?.trim()) {
      errors.price = 'Price is required'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Price must be a positive number'
    }

    if (!formData.estimatedDays?.trim()) {
      errors.estimatedDays = 'Estimated days is required'
    } else if (isNaN(Number(formData.estimatedDays)) || Number(formData.estimatedDays) < 1) {
      errors.estimatedDays = 'Estimated days must be at least 1'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (validateForm()) {
      try {
        setIsAdding(true)
        const response = await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            estimatedDays: Number(formData.estimatedDays),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create shipping method')
        }

        const newMethod = await response.json()
        setMethods([...methods, newMethod])
        setShowForm(false)
        setFormData({
          name: '',
          description: '',
          price: '',
          estimatedDays: '',
          isActive: true,
        })
        setFormErrors({})
        toast.success('Shipping method created successfully')
      } catch (error) {
        console.error('Error creating shipping method:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create shipping method')
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleView = (method: ShippingMethod) => {
    setSelectedMethod(method)
    setShowViewModal(true)
  }

  const handleEdit = (method: ShippingMethod) => {
    setSelectedMethod(method)
    setEditFormData({
      name: method.name,
      description: method.description || '',
      price: method.price,
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (formData: Partial<ShippingMethod>) => {
    if (selectedMethod && formData.name) {
      try {
        setIsUpdating(true)
        if (!formData.price || !formData.estimatedDays) {
          toast.error('Please fill in all required fields')
          return
        }

        const response = await fetch('/api/admin/shipping', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedMethod.id, ...formData }),
        })

        if (!response.ok) throw new Error('Failed to update shipping method')

        const updatedMethod = await response.json()
        setMethods(methods.map((method) => (method.id === selectedMethod.id ? updatedMethod : method)))
        setShowEditModal(false)
        setSelectedMethod(null)
        toast.success('Shipping method updated successfully')
      } catch (error) {
        console.error('Error updating shipping method:', error)
        toast.error('Failed to update shipping method')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const response = await fetch(`/api/admin/shipping?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete shipping method')

      setMethods(methods.filter((method) => method.id !== id))
      toast.success('Shipping method deleted successfully')
    } catch (error) {
      console.error('Error deleting shipping method:', error)
      toast.error('Failed to delete shipping method')
    } finally {
      setIsDeleting(null)
    }
  }

  const ViewModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl'
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              Shipping Method Details
            </h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowViewModal(false)}
              className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            >
              <FiX className='h-5 w-5' />
            </Button>
          </div>

          {selectedMethod && (
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Name
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedMethod.name}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Price
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    ${Number(selectedMethod.price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Estimated Days
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedMethod.estimatedDays} days
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Status
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMethod.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {selectedMethod.isActive ? (
                      <FiCheck className='mr-1.5 h-4 w-4' />
                    ) : (
                      <FiXCircle className='mr-1.5 h-4 w-4' />
                    )}
                    {selectedMethod.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className='col-span-2'>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Description
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedMethod.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-end mt-6'>
            <Button
              variant='outline'
              onClick={() => setShowViewModal(false)}
              className='h-12 px-8 border-gray-200 dark:border-gray-700'
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='space-y-8 p-8'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center justify-between'
        >
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Shipping Methods
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
              Manage shipping methods and their rates
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              onClick={() => setShowForm(false)}
              className='h-12 px-8 border-gray-200 dark:border-gray-700'
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200'
            >
              <FiPlus className='mr-2 h-4 w-4' />
              Add Method
            </Button>
          </div>
        </motion.div>

        {/* Add Method Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
                    Add New Shipping Method
                  </h2>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowForm(false)}
                    className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  >
                    <FiX className='h-5 w-5' />
                  </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Name <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='Enter method name'
                      className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.name ? 'border-red-500' : ''
                      }`}
                    />
                    {formErrors.name && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Price <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder='Enter price'
                      className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.price ? 'border-red-500' : ''
                      }`}
                    />
                    {formErrors.price && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Estimated Days <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      type='number'
                      min='1'
                      value={formData.estimatedDays}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDays: e.target.value })
                      }
                      placeholder='Enter estimated days'
                      className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.estimatedDays ? 'border-red-500' : ''
                      }`}
                    />
                    {formErrors.estimatedDays && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.estimatedDays}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === 'true',
                        })
                      }
                      className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
                    >
                      <option value='true'>Active</option>
                      <option value='false'>Inactive</option>
                    </select>
                  </div>

                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Description
                    </label>
                    <Input
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder='Enter description'
                      className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-4 mt-8'>
                  <Button
                    variant='outline'
                    onClick={() => setShowForm(false)}
                    className='h-12 px-8 border-gray-200 dark:border-gray-700'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className='h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  >
                    {isAdding ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Method'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Methods Table */}
        <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='overflow-x-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              </div>
            ) : (
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Name
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Price
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Estimated Days
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Status
                    </th>
                    <th className='text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((method) => (
                    <tr
                      key={method.id}
                      className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    >
                      <td className='py-4 px-6'>
                        <div className='flex items-center'>
                          <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3'>
                            <FiTruck className='h-5 w-5' />
                          </div>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {method.name}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          ${Number(method.price).toFixed(2)}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {method.estimatedDays} days
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            method.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {method.isActive ? (
                            <FiCheck className='mr-1.5 h-4 w-4' />
                          ) : (
                            <FiXCircle className='mr-1.5 h-4 w-4' />
                          )}
                          {method.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleView(method)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEye className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(method)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEdit2 className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(method.id)}
                            disabled={isDeleting === method.id}
                            className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                          >
                            {isDeleting === method.id ? (
                              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-red-600'></div>
                            ) : (
                              <FiTrash2 className='h-5 w-5' />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* View Modal */}
      <AnimatePresence>{showViewModal && <ViewModal />}</AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedMethod(null)
            }}
            method={selectedMethod}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
