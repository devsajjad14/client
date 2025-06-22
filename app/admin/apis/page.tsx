'use client'

import { useState, useEffect, useCallback, memo } from 'react'
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
  FiLink,
  FiCopy,
  FiEyeOff,
  FiCheck,
  FiLoader,
} from 'react-icons/fi'
import { toast } from 'sonner'
import type { ApiIntegration, NewApiIntegration } from '@/lib/db/schema'
import {
  getApiIntegrations,
  addApiIntegration,
  updateApiIntegration,
  deleteApiIntegration,
} from '@/lib/actions/api-integrations'
import { useRouter } from 'next/navigation'

interface FormData {
  name: string
  customerName: string
  customerPassword: string
  apiKey: string
  apiSecret: string
  token: string
  refreshToken: string
  additionalFields: {
    field1: string
    field2: string
    field3: string
    field4: string
    field5: string
  }
}

interface SensitiveInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  label: string
  show: boolean
  setShow: (show: boolean) => void
  onCopy?: (text: string, field: string) => void
  copiedField?: string | null
}

const initialFormData: FormData = {
  name: '',
  customerName: '',
  customerPassword: '',
  apiKey: '',
  apiSecret: '',
  token: '',
  refreshToken: '',
  additionalFields: {
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
  },
}

const EditModalContent = memo(({ 
  editFormData, 
  handleEditChange, 
  handleUpdate, 
  setShowEditModal,
  showEditApiKey,
  setShowEditApiKey,
  showEditApiSecret,
  setShowEditApiSecret,
  showEditToken,
  setShowEditToken,
  showEditRefreshToken,
  setShowEditRefreshToken,
  handleCopy,
  copiedField,
  isSaving
}: {
  editFormData: FormData
  handleEditChange: (field: keyof FormData, value: string) => void
  handleUpdate: () => void
  setShowEditModal: (show: boolean) => void
  showEditApiKey: boolean
  setShowEditApiKey: (show: boolean) => void
  showEditApiSecret: boolean
  setShowEditApiSecret: (show: boolean) => void
  showEditToken: boolean
  setShowEditToken: (show: boolean) => void
  showEditRefreshToken: boolean
  setShowEditRefreshToken: (show: boolean) => void
  handleCopy: (text: string, field: string) => void
  copiedField: string | null
  isSaving: boolean
}) => (
  <div className='p-6'>
    <div className='flex items-center justify-between mb-6'>
      <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
        Edit Integration
      </h2>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => setShowEditModal(false)}
        className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      >
        <FiX className='h-5 w-5' />
      </Button>
    </div>

    <div className='grid grid-cols-2 gap-6'>
      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Integration Name
        </label>
        <Input
          value={editFormData.name}
          onChange={(e) => handleEditChange('name', e.target.value)}
          placeholder='e.g., PayPal Integration'
          className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Customer Name
        </label>
        <Input
          value={editFormData.customerName}
          onChange={(e) => handleEditChange('customerName', e.target.value)}
          placeholder='Enter customer name'
          className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
        />
      </div>

      <SensitiveInput
        label='API Key'
        value={editFormData.apiKey}
        onChange={(e) => handleEditChange('apiKey', e.target.value)}
        placeholder='Enter API key'
        show={showEditApiKey}
        setShow={setShowEditApiKey}
        onCopy={handleCopy}
        copiedField={copiedField}
      />

      <SensitiveInput
        label='API Secret'
        value={editFormData.apiSecret}
        onChange={(e) => handleEditChange('apiSecret', e.target.value)}
        placeholder='Enter API secret'
        show={showEditApiSecret}
        setShow={setShowEditApiSecret}
        onCopy={handleCopy}
        copiedField={copiedField}
      />

      <SensitiveInput
        label='Token'
        value={editFormData.token}
        onChange={(e) => handleEditChange('token', e.target.value)}
        placeholder='Enter token'
        show={showEditToken}
        setShow={setShowEditToken}
        onCopy={handleCopy}
        copiedField={copiedField}
      />

      <SensitiveInput
        label='Refresh Token'
        value={editFormData.refreshToken}
        onChange={(e) => handleEditChange('refreshToken', e.target.value)}
        placeholder='Enter refresh token'
        show={showEditRefreshToken}
        setShow={setShowEditRefreshToken}
        onCopy={handleCopy}
        copiedField={copiedField}
      />
    </div>

    <div className='flex justify-end gap-4 mt-8'>
      <Button
        variant='outline'
        onClick={() => setShowEditModal(false)}
        className='h-12 px-8 border-gray-200 dark:border-gray-700'
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button
        onClick={handleUpdate}
        disabled={isSaving}
        className='h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
      >
        {isSaving ? (
          <>
            <FiLoader className='mr-2 h-4 w-4 animate-spin' />
            Updating...
          </>
        ) : (
          'Update Integration'
        )}
      </Button>
    </div>
  </div>
))

const EditModal = memo(({ 
  editFormData, 
  handleEditChange, 
  handleUpdate, 
  setShowEditModal,
  showEditApiKey,
  setShowEditApiKey,
  showEditApiSecret,
  setShowEditApiSecret,
  showEditToken,
  setShowEditToken,
  showEditRefreshToken,
  setShowEditRefreshToken,
  handleCopy,
  copiedField,
  isSaving
}: {
  editFormData: FormData
  handleEditChange: (field: keyof FormData, value: string) => void
  handleUpdate: () => void
  setShowEditModal: (show: boolean) => void
  showEditApiKey: boolean
  setShowEditApiKey: (show: boolean) => void
  showEditApiSecret: boolean
  setShowEditApiSecret: (show: boolean) => void
  showEditToken: boolean
  setShowEditToken: (show: boolean) => void
  showEditRefreshToken: boolean
  setShowEditRefreshToken: (show: boolean) => void
  handleCopy: (text: string, field: string) => void
  copiedField: string | null
  isSaving: boolean
}) => (
  <motion.div
    key="modal-backdrop"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
  >
    <motion.div
      key="modal-content"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl'
    >
      <EditModalContent
        editFormData={editFormData}
        handleEditChange={handleEditChange}
        handleUpdate={handleUpdate}
        setShowEditModal={setShowEditModal}
        showEditApiKey={showEditApiKey}
        setShowEditApiKey={setShowEditApiKey}
        showEditApiSecret={showEditApiSecret}
        setShowEditApiSecret={setShowEditApiSecret}
        showEditToken={showEditToken}
        setShowEditToken={setShowEditToken}
        showEditRefreshToken={showEditRefreshToken}
        setShowEditRefreshToken={setShowEditRefreshToken}
        handleCopy={handleCopy}
        copiedField={copiedField}
        isSaving={isSaving}
      />
    </motion.div>
  </motion.div>
))

const SensitiveInput = ({
  value,
  onChange,
  placeholder,
  label,
  show,
  setShow,
  onCopy,
  copiedField,
}: SensitiveInputProps) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
      {label}
    </label>
    <div className='relative'>
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 pr-24'
      />
      <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2'>
        <Button
          type="button"
          variant='ghost'
          size='icon'
          onClick={(e) => {
            e.preventDefault();
            setShow(!show);
          }}
          className='h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          {show ? (
            <FiEyeOff className='h-4 w-4' />
          ) : (
            <FiEye className='h-4 w-4' />
          )}
        </Button>
        {onCopy && (
          <Button
            type="button"
            variant='ghost'
            size='icon'
            onClick={(e) => {
              e.preventDefault();
              onCopy(value, label);
            }}
            className='h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
          >
            {copiedField === label ? (
              <FiCheck className='h-4 w-4' />
            ) : (
              <FiCopy className='h-4 w-4' />
            )}
          </Button>
        )}
      </div>
    </div>
  </div>
)

export default function ApisPage() {
  const [showForm, setShowForm] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [showCustomerPassword, setShowCustomerPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)
  const [showEditApiKey, setShowEditApiKey] = useState(false)
  const [showEditApiSecret, setShowEditApiSecret] = useState(false)
  const [showEditToken, setShowEditToken] = useState(false)
  const [showEditRefreshToken, setShowEditRefreshToken] = useState(false)
  const [showViewApiKey, setShowViewApiKey] = useState(false)
  const [showViewApiSecret, setShowViewApiSecret] = useState(false)
  const [showViewToken, setShowViewToken] = useState(false)
  const [showViewRefreshToken, setShowViewRefreshToken] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [editFormData, setEditFormData] = useState<FormData>(initialFormData)
  const router = useRouter()

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      const data = await getApiIntegrations()
      setIntegrations(data)
    } catch (error) {
      toast.error('Failed to load integrations')
      console.error('Error loading integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleAdd = async () => {
    if (formData.name) {
      try {
        setIsSaving(true)
        const newIntegration: NewApiIntegration = {
          name: formData.name,
          customerName: formData.customerName,
          customerPassword: formData.customerPassword,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
          token: formData.token,
          refreshToken: formData.refreshToken,
          additionalFields: formData.additionalFields,
        }
        await addApiIntegration(newIntegration)
        await loadIntegrations()
        setShowForm(false)
        setFormData(initialFormData)
        toast.success('Integration added successfully')
      } catch (error) {
        toast.error('Failed to add integration')
        console.error('Error adding integration:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleView = (integration: ApiIntegration) => {
    router.push(`/admin/apis/${integration.id}/view`)
  }

  const handleEdit = (integration: ApiIntegration) => {
    router.push(`/admin/apis/${integration.id}/edit`)
  }

  const handleEditChange = useCallback((field: keyof FormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleAdditionalFieldChange = (field: keyof FormData['additionalFields'], value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: value,
      },
    }))
  }

  const handleUpdate = useCallback(async () => {
    if (selectedIntegration && editFormData.name) {
      try {
        setIsSaving(true)
        await updateApiIntegration(selectedIntegration.id, {
          name: editFormData.name,
          customerName: editFormData.customerName,
          customerPassword: editFormData.customerPassword,
          apiKey: editFormData.apiKey,
          apiSecret: editFormData.apiSecret,
          token: editFormData.token,
          refreshToken: editFormData.refreshToken,
          additionalFields: editFormData.additionalFields,
        })
        await loadIntegrations()
        setShowEditModal(false)
        setEditFormData(initialFormData)
        setSelectedIntegration(null)
        toast.success('Integration updated successfully')
      } catch (error) {
        toast.error('Failed to update integration')
        console.error('Error updating integration:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }, [selectedIntegration, editFormData, loadIntegrations])

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true)
      await deleteApiIntegration(id)
      await loadIntegrations()
      toast.success('Integration deleted successfully')
    } catch (error) {
      toast.error('Failed to delete integration')
      console.error('Error deleting integration:', error)
    } finally {
      setIsDeleting(false)
    }
  }

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
              API Integrations
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
              Manage your API integrations and credentials
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
              Add
            </Button>
          </div>
        </motion.div>

        {/* Add Integration Form */}
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
                    Add New Integration
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
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Integration Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder='e.g., PayPal Integration'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Customer Name
                      </label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        placeholder='Enter customer name'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>

                    <SensitiveInput
                      label='Customer Password'
                      value={formData.customerPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          customerPassword: e.target.value,
                        })
                      }
                      placeholder='Enter customer password'
                      show={showCustomerPassword}
                      setShow={setShowCustomerPassword}
                    />

                    <SensitiveInput
                      label='API Key'
                      value={formData.apiKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, apiKey: e.target.value })
                      }
                      placeholder='Enter API key'
                      show={showApiKey}
                      setShow={setShowApiKey}
                    />

                    <SensitiveInput
                      label='API Secret'
                      value={formData.apiSecret}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, apiSecret: e.target.value })
                      }
                      placeholder='Enter API secret'
                      show={showApiSecret}
                      setShow={setShowApiSecret}
                    />
                  </div>

                  <div className='space-y-4'>
                    <SensitiveInput
                      label='Token'
                      value={formData.token}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, token: e.target.value })
                      }
                      placeholder='Enter token'
                      show={showToken}
                      setShow={setShowToken}
                    />

                    <SensitiveInput
                      label='Refresh Token'
                      value={formData.refreshToken}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          refreshToken: e.target.value,
                        })
                      }
                      placeholder='Enter refresh token'
                      show={showRefreshToken}
                      setShow={setShowRefreshToken}
                    />

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Additional Field 1
                      </label>
                      <Input
                        value={formData.additionalFields.field1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalFields: {
                              ...formData.additionalFields,
                              field1: e.target.value,
                            },
                          })
                        }
                        placeholder='Enter additional field 1'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Additional Field 2
                      </label>
                      <Input
                        value={formData.additionalFields.field2}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalFields: {
                              ...formData.additionalFields,
                              field2: e.target.value,
                            },
                          })
                        }
                        placeholder='Enter additional field 2'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Additional Field 3
                      </label>
                      <Input
                        value={formData.additionalFields.field3}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalFields: {
                              ...formData.additionalFields,
                              field3: e.target.value,
                            },
                          })
                        }
                        placeholder='Enter additional field 3'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>
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
                    disabled={isSaving}
                    className='h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  >
                    {isSaving ? (
                      <>
                        <FiLoader className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Integrations Table */}
        <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
          <div className='overflow-x-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <FiLoader className='h-8 w-8 animate-spin text-blue-600' />
              </div>
            ) : (
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Name
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Customer
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      API Key
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
                  {integrations.map((integration) => (
                    <tr
                      key={integration.id}
                      className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    >
                      <td className='py-4 px-6'>
                        <div className='flex items-center'>
                          <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3'>
                            <FiLink className='h-5 w-5' />
                          </div>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {integration.name}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {integration.customerName}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 dark:text-gray-300 font-mono'>
                            ••••••••••••
                          </span>
                          <div className='flex items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() =>
                                handleCopy(
                                  integration.apiKey,
                                  `apiKey-${integration.id}`
                                )
                              }
                              className='h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                            >
                              {copiedField === `apiKey-${integration.id}` ? (
                                <FiCheck className='h-4 w-4' />
                              ) : (
                                <FiCopy className='h-4 w-4' />
                              )}
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleView(integration)}
                              className='h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                            >
                              <FiEye className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                          Active
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleView(integration)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEye className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(integration)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEdit2 className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(integration.id)}
                            disabled={isDeleting}
                            className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                          >
                            {isDeleting ? (
                              <FiLoader className='h-5 w-5 animate-spin' />
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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditModal
            editFormData={editFormData}
            handleEditChange={handleEditChange}
            handleUpdate={handleUpdate}
            setShowEditModal={setShowEditModal}
            showEditApiKey={showEditApiKey}
            setShowEditApiKey={setShowEditApiKey}
            showEditApiSecret={showEditApiSecret}
            setShowEditApiSecret={setShowEditApiSecret}
            showEditToken={showEditToken}
            setShowEditToken={setShowEditToken}
            showEditRefreshToken={showEditRefreshToken}
            setShowEditRefreshToken={setShowEditRefreshToken}
            handleCopy={handleCopy}
            copiedField={copiedField}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
