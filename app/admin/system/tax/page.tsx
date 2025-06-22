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
  FiPercent,
  FiCheck,
  FiXCircle,
} from 'react-icons/fi'
import { toast } from 'sonner'

interface TaxRate {
  id: string
  name: string
  rate: string | number
  country: string
  state: string | null
  zipCode: string | null
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

interface TaxRateFormData {
  name: string
  rate: string
  country: string
  state: string
  zipCode: string
  isActive: boolean
  priority: string
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  rate: TaxRate | null
  onUpdate: (data: Partial<TaxRate>) => Promise<void>
  isUpdating: boolean
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const EditModal = ({ isOpen, onClose, rate, onUpdate, isUpdating }: EditModalProps) => {
  const [formData, setFormData] = useState<Partial<TaxRate>>({
    name: '',
    rate: 0,
    country: '',
    state: '',
    zipCode: '',
    isActive: true,
    priority: 0,
  })

  useEffect(() => {
    if (rate) {
      setFormData({
        name: rate.name,
        rate: rate.rate,
        country: rate.country,
        state: rate.state || '',
        zipCode: rate.zipCode || '',
        isActive: rate.isActive,
        priority: rate.priority,
      })
    }
  }, [rate])

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
              Edit Tax Rate
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
                Rate (%) <span className='text-red-500'>*</span>
              </label>
              <Input
                name="rate"
                type='number'
                step='0.01'
                min='0'
                value={formData.rate || ''}
                onChange={handleInputChange}
                placeholder='Enter rate'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Country <span className='text-red-500'>*</span>
              </label>
              <select
                name="country"
                value={formData.country || ''}
                onChange={handleInputChange}
                className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
              >
                <option value="">Please select a country</option>
                <option value="USA">USA</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                State
              </label>
              <select
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
                disabled={formData.country !== 'USA'}
              >
                <option value="">Please select a state</option>
                {US_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                ZIP Code
              </label>
              <Input
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleInputChange}
                placeholder='Enter ZIP code'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Priority
              </label>
              <Input
                name="priority"
                type='number'
                min='0'
                value={formData.priority || ''}
                onChange={handleInputChange}
                placeholder='Enter priority'
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
                'Update Rate'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function TaxPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedRate, setSelectedRate] = useState<TaxRate | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [rates, setRates] = useState<TaxRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState<TaxRateFormData>({
    name: '',
    rate: '',
    country: '',
    state: '',
    zipCode: '',
    isActive: true,
    priority: '0',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/admin/tax')
      if (!response.ok) throw new Error('Failed to fetch tax rates')
      const data = await response.json()
      setRates(data)
    } catch (error) {
      console.error('Error fetching tax rates:', error)
      toast.error('Failed to fetch tax rates')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.rate?.trim()) {
      errors.rate = 'Rate is required'
    } else if (isNaN(Number(formData.rate)) || Number(formData.rate) < 0) {
      errors.rate = 'Rate must be a positive number'
    }

    if (!formData.country?.trim()) {
      errors.country = 'Country is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (validateForm()) {
      try {
        setIsAdding(true)
        const response = await fetch('/api/admin/tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            rate: Number(formData.rate),
            priority: Number(formData.priority),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create tax rate')
        }

        const newRate = await response.json()
        setRates([...rates, newRate])
        setShowForm(false)
        setFormData({
          name: '',
          rate: '',
          country: '',
          state: '',
          zipCode: '',
          isActive: true,
          priority: '0',
        })
        setFormErrors({})
        toast.success('Tax rate created successfully')
      } catch (error) {
        console.error('Error creating tax rate:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create tax rate')
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleView = (rate: TaxRate) => {
    setSelectedRate(rate)
    setShowViewModal(true)
  }

  const handleEdit = (rate: TaxRate) => {
    setSelectedRate(rate)
    setShowEditModal(true)
  }

  const handleUpdate = async (formData: Partial<TaxRate>) => {
    if (selectedRate && formData.name) {
      try {
        setIsUpdating(true)
        if (!formData.rate || !formData.country) {
          toast.error('Please fill in all required fields')
          return
        }

        const response = await fetch('/api/admin/tax', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedRate.id, ...formData }),
        })

        if (!response.ok) throw new Error('Failed to update tax rate')

        const updatedRate = await response.json()
        setRates(rates.map((rate) => (rate.id === selectedRate.id ? updatedRate : rate)))
        setShowEditModal(false)
        setSelectedRate(null)
        toast.success('Tax rate updated successfully')
      } catch (error) {
        console.error('Error updating tax rate:', error)
        toast.error('Failed to update tax rate')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const response = await fetch(`/api/admin/tax?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete tax rate')

      setRates(rates.filter((rate) => rate.id !== id))
      toast.success('Tax rate deleted successfully')
    } catch (error) {
      console.error('Error deleting tax rate:', error)
      toast.error('Failed to delete tax rate')
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
              Tax Rate Details
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

          {selectedRate && (
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Name
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedRate.name}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Rate
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {Number(selectedRate.rate).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Country
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedRate.country}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    State
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedRate.state || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    ZIP Code
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedRate.zipCode || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Priority
                  </h3>
                  <p className='text-gray-900 dark:text-white'>
                    {selectedRate.priority}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                    Status
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRate.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {selectedRate.isActive ? (
                      <FiCheck className='mr-1.5 h-4 w-4' />
                    ) : (
                      <FiXCircle className='mr-1.5 h-4 w-4' />
                    )}
                    {selectedRate.isActive ? 'Active' : 'Inactive'}
                  </span>
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
              Tax Rates
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
              Manage tax rates and their configurations
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
              Add Rate
            </Button>
          </div>
        </motion.div>

        {/* Add Rate Form */}
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
                    Add New Tax Rate
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
                      placeholder='Enter rate name'
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
                      Rate (%) <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                      placeholder='Enter rate'
                      className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.rate ? 'border-red-500' : ''
                      }`}
                    />
                    {formErrors.rate && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.rate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Country <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value, state: '' })
                      }
                      className={`w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3 ${
                        formErrors.country ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Please select a country</option>
                      <option value="USA">USA</option>
                    </select>
                    {formErrors.country && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
                      disabled={formData.country !== 'USA'}
                    >
                      <option value="">Please select a state</option>
                      {US_STATES.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      ZIP Code
                    </label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      placeholder='Enter ZIP code'
                      className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Priority
                    </label>
                    <Input
                      type='number'
                      min='0'
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      placeholder='Enter priority'
                      className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                    />
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
                      'Add Rate'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rates Table */}
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
                      Rate
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Country
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      State
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Priority
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
                  {rates.map((rate) => (
                    <tr
                      key={rate.id}
                      className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    >
                      <td className='py-4 px-6'>
                        <div className='flex items-center'>
                          <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3'>
                            <FiPercent className='h-5 w-5' />
                          </div>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {rate.name}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {Number(rate.rate).toFixed(2)}%
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {rate.country}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {rate.state || 'N/A'}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {rate.priority}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            rate.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {rate.isActive ? (
                            <FiCheck className='mr-1.5 h-4 w-4' />
                          ) : (
                            <FiXCircle className='mr-1.5 h-4 w-4' />
                          )}
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleView(rate)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEye className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(rate)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEdit2 className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(rate.id)}
                            disabled={isDeleting === rate.id}
                            className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                          >
                            {isDeleting === rate.id ? (
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
              setSelectedRate(null)
            }}
            rate={selectedRate}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
