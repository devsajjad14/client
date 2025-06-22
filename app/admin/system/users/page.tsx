'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiUser,
  FiCheck,
  FiXCircle,
  FiEyeOff,
  FiUpload,
  FiImage,
} from 'react-icons/fi'
import { toast } from 'sonner'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  password?: string
  image: string | null
  profile?: {
    firstName: string
    lastName: string
    phone: string
    avatarUrl: string | null
  }
  role: string
  status: string
  address: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  confirmPassword?: string
  phoneNumber: string
  image: string | File | null
  role: string
  status: string
  address: string
}

const ImageUpload = ({ 
  image, 
  onImageChange, 
  className = '',
  tempImage,
  onTempImageChange
}: { 
  image: string | File | null | undefined, 
  onImageChange: (file: File | null) => void,
  className?: string,
  tempImage?: File | null,
  onTempImageChange?: (file: File | null) => void
}) => {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (tempImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(tempImage)
    } else if (image instanceof File) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(image)
    } else if (typeof image === 'string') {
      setPreview(image)
    } else {
      setPreview(null)
    }
  }, [image, tempImage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      
      // Store temporarily instead of immediately setting
      if (onTempImageChange) {
        onTempImageChange(file)
      } else {
        onImageChange(file)
      }
    }
  }

  const handleRemove = () => {
    if (onTempImageChange) {
      onTempImageChange(null)
    } else {
      onImageChange(null)
    }
    setPreview(null)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
          {preview ? (
            <Image
              src={preview}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiUser className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="h-10"
            >
              <FiUpload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemove}
                className="h-10 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <FiXCircle className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Max file size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>
    </div>
  )
}

// Move EditModal outside the main component
const EditModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdate 
}: { 
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUpdate: (formData: Partial<UserFormData>) => Promise<void>
}) => {
  const [editFormData, setEditFormData] = useState<Partial<UserFormData>>({
    name: '',
    email: '',
    phoneNumber: '',
    image: null,
    role: 'user',
    status: 'active',
    address: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Temporary storage for profile image before upload
  const [tempEditImage, setTempEditImage] = useState<File | null>(null)
  const [tempEditPreview, setTempEditPreview] = useState<string>('')

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.profile?.phone || '',
        image: user.image || null,
        role: user.role || 'user',
        status: user.status || 'active',
        address: user.address || '',
      })
      // Clear temporary image when user changes
      setTempEditImage(null)
      setTempEditPreview('')
    }
  }, [user])

  const handleUpdate = async () => {
    if (!editFormData.email || !editFormData.phoneNumber || !editFormData.role || !editFormData.status) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsUpdating(true)
      setIsUploading(false)
      
      // Upload profile image to Vercel Blob if there's a temporary image
      let imageUrl = editFormData.image as string || null
      if (tempEditImage) {
        setIsUploading(true)
        const formDataToUpload = new FormData()
        formDataToUpload.append('file', tempEditImage)
        
        const uploadResponse = await fetch('/api/upload/user-profile', {
          method: 'POST',
          body: formDataToUpload,
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile image')
        }
        
        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.url
        setIsUploading(false)
      }

      // Create form data for update
      const formDataToSend = new FormData()
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'image') {
          formDataToSend.append(key, value)
        }
      })
      
      // Add the uploaded image URL
      if (imageUrl) {
        formDataToSend.append('image', imageUrl)
      }

      // Call the parent update function with the updated data
      await onUpdate({
        ...editFormData,
        image: imageUrl
      })
      
      // Clean up temporary image
      if (tempEditImage) {
        setTempEditImage(null)
        setTempEditPreview('')
      }
      
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setIsUpdating(false)
      setIsUploading(false)
    }
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
        transition={{ duration: 0.2 }}
        className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl'
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              Edit User
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <ImageUpload
              image={editFormData.image}
              onImageChange={(file) => setEditFormData({ ...editFormData, image: file })}
              tempImage={tempEditImage}
              onTempImageChange={(file) => setTempEditImage(file)}
              className="md:col-span-2"
            />

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Name <span className='text-red-500'>*</span>
              </label>
              <Input
                value={editFormData.name || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder='Enter name'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Email <span className='text-red-500'>*</span>
              </label>
              <Input
                value={editFormData.email || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                placeholder='Enter email'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Phone Number <span className='text-red-500'>*</span>
              </label>
              <Input
                value={editFormData.phoneNumber || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phoneNumber: e.target.value })
                }
                placeholder='Enter phone number'
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Role <span className='text-red-500'>*</span>
              </label>
              <select
                value={editFormData.role || 'user'}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className='h-12 w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Address
                </label>
                <textarea
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder='Enter address'
                  className='h-12 w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Status
                </label>
                <div className="flex items-center h-12">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editFormData.status === 'active'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.checked ? 'active' : 'inactive' })}
                    />
                    <Label className={`text-sm font-medium ${
                      editFormData.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {editFormData.status === 'active' ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>
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
              onClick={handleUpdate}
              disabled={isUpdating || isUploading}
              className='h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            >
              {isUpdating ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Updating...</span>
                </div>
              ) : isUploading ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Uploading Image...</span>
                </div>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Temporary storage for profile image before upload
  const [tempProfileImage, setTempProfileImage] = useState<File | null>(null)
  const [tempProfilePreview, setTempProfilePreview] = useState<string>('')

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    image: null,
    role: 'user',
    status: 'active',
    address: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password?.trim()) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }

    if (!formData.role?.trim()) {
      errors.role = 'Role is required'
    }

    if (!formData.status?.trim()) {
      errors.status = 'Status is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (validateForm()) {
      try {
        setIsAdding(true)
        setIsUploading(false)
        
        // Check if email already exists
        const checkResponse = await fetch(`/api/admin/users/check-email?email=${encodeURIComponent(formData.email)}`)
        const { exists } = await checkResponse.json()
        
        if (exists) {
          setFormErrors({ ...formErrors, email: 'Email already exists' })
          return
        }

        // Upload profile image to Vercel Blob if there's a temporary image
        let imageUrl = formData.image as string || null
        if (tempProfileImage) {
          setIsUploading(true)
          const formDataToUpload = new FormData()
          formDataToUpload.append('file', tempProfileImage)
          
          const uploadResponse = await fetch('/api/upload/user-profile', {
            method: 'POST',
            body: formDataToUpload,
          })
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload profile image')
          }
          
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
          setIsUploading(false)
        }

        // Create FormData for user creation
        const formDataToSend = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== 'image') {
            formDataToSend.append(key, value)
          }
        })
        
        // Add the uploaded image URL
        if (imageUrl) {
          formDataToSend.append('image', imageUrl)
        }

        const response = await fetch('/api/admin/users', {
          method: 'POST',
          body: formDataToSend,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create user')
        }

        const newUser = await response.json()
        setUsers([...users, newUser])
        setShowForm(false)
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          image: null,
          role: 'user',
          status: 'active',
          address: '',
        })
        setFormErrors({})
        
        // Clean up temporary image
        if (tempProfileImage) {
          setTempProfileImage(null)
          setTempProfilePreview('')
        }
        
        toast.success('User created successfully')
      } catch (error) {
        console.error('Error creating user:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create user')
      } finally {
        setIsAdding(false)
        setIsUploading(false)
      }
    }
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUpdate = async (formData: Partial<UserFormData>) => {
    if (!selectedUser) return

    try {
      // Create FormData for user update
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value)
        }
      })
      formDataToSend.append('id', selectedUser.id)

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!response.ok) throw new Error('Failed to update user')

      const updatedUser = await response.json()
      setUsers(users.map((user) => (user.id === selectedUser.id ? updatedUser : user)))
      setSelectedUser(null)
      toast.success('User updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      // Remove from UI immediately
      setUsers(users.filter((user) => user.id !== id))
      toast.success('User deleted successfully')
      
      // Refresh data to ensure sync with database
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
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
        className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden'
      >
        {selectedUser && (
          <>
            {/* Header with background gradient */}
            <div className='relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowViewModal(false)}
                className='absolute right-4 top-4 text-white hover:bg-white/20'
              >
                <FiX className='h-5 w-5' />
              </Button>
            </div>

            {/* Profile Section */}
            <div className='px-6 pb-6'>
              <div className='relative flex flex-col items-center'>
                {/* Profile Image */}
                <div className='absolute -top-16 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 shadow-xl'>
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      width={128}
                      height={128}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'>
                      <FiUser className='h-12 w-12 text-gray-400 dark:text-gray-500' />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className='mt-20 text-center mb-8'>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {selectedUser.name}
                  </h2>
                  <p className='text-gray-500 dark:text-gray-400 mt-1'>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </p>
                  <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {selectedUser.status === 'active' ? (
                      <FiCheck className='mr-1 h-3 w-3' />
                    ) : (
                      <FiXCircle className='mr-1 h-3 w-3' />
                    )}
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </div>
                </div>

                {/* Detailed Information */}
                <div className='w-full grid grid-cols-2 gap-6 border-t border-gray-200 dark:border-gray-700 pt-6'>
                  <div>
                    <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                      Contact Information
                    </h3>
                    <div className='space-y-3'>
                      <div>
                        <label className='text-xs text-gray-500 dark:text-gray-400'>Email</label>
                        <p className='text-gray-900 dark:text-white'>{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className='text-xs text-gray-500 dark:text-gray-400'>Phone</label>
                        <p className='text-gray-900 dark:text-white'>{selectedUser.profile?.phone || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                      Additional Details
                    </h3>
                    <div className='space-y-3'>
                      <div>
                        <label className='text-xs text-gray-500 dark:text-gray-400'>Address</label>
                        <p className='text-gray-900 dark:text-white'>{selectedUser.address || 'Not set'}</p>
                      </div>
                      <div>
                        <label className='text-xs text-gray-500 dark:text-gray-400'>User ID</label>
                        <p className='text-gray-900 dark:text-white font-mono text-sm'>{selectedUser.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50'>
              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  onClick={() => setShowViewModal(false)}
                  className='h-10 px-6'
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
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
              User Management
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
              Manage system users and their permissions
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
              Add User
            </Button>
          </div>
        </motion.div>

        {/* Add User Form */}
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
                    Add New User
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
                  <ImageUpload
                    image={formData.image}
                    onImageChange={(file) => setFormData({ ...formData, image: file })}
                    tempImage={tempProfileImage}
                    onTempImageChange={(file) => setTempProfileImage(file)}
                    className="md:col-span-2"
                  />

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Name <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='Enter full name'
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
                      Email <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder='Enter email address'
                      className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {formErrors.email && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Password <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder='Enter password'
                        className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 pr-12 ${
                          formErrors.password ? 'border-red-500' : ''
                        }`}
                      />
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-blue-600'
                      >
                        {showPassword ? (
                          <FiEyeOff className='h-4 w-4' />
                        ) : (
                          <FiEye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    {formErrors.password && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Confirm Password <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder='Confirm password'
                        className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 pr-12 ${
                          formErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                      />
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-blue-600'
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className='h-4 w-4' />
                        ) : (
                          <FiEye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Phone <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      placeholder='Enter phone number'
                      className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.phoneNumber ? 'border-red-500' : ''
                      }`}
                    />
                    {formErrors.phoneNumber && (
                      <p className='mt-1 text-sm text-red-500'>
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Role <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className={`h-12 w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                        formErrors.role ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                    {formErrors.role && (
                      <p className='mt-1 text-sm text-red-500'>{formErrors.role}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder='Enter address'
                        className={`h-12 w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                          formErrors.address ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.address && (
                        <p className='mt-1 text-sm text-red-500'>{formErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Status
                      </label>
                      <div className="flex items-center h-12">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.status === 'active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                          />
                          <Label className={`text-sm font-medium ${
                            formData.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {formData.status === 'active' ? 'Active' : 'Inactive'}
                          </Label>
                        </div>
                      </div>
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
                    type="button"
                    onClick={handleAdd}
                    disabled={isAdding || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding User...</span>
                      </div>
                    ) : isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading Image...</span>
                      </div>
                    ) : (
                      <>
                        <FiPlus className="mr-2 h-5 w-5" />
                        Save Data
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
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
                      Profile
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Name
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Email
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Phone
                    </th>
                    <th className='text-left py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Role
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
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    >
                      <td className='py-4 px-6'>
                        <div className='flex items-center'>
                          <div className='relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'>
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name}
                                fill
                                className='object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                <FiUser className='h-6 w-6' />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {user.name}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {user.email}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {user.profile?.phone || 'Not set'}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : user.role === 'manager'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {user.status === 'active' ? (
                            <>
                              <FiCheck className='mr-1 h-3 w-3' />
                              Active
                            </>
                          ) : (
                            <>
                              <FiXCircle className='mr-1 h-3 w-3' />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleView(user)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEye className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(user)}
                            className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                          >
                            <FiEdit2 className='h-5 w-5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(user.id)}
                            disabled={isDeleting === user.id}
                            className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                          >
                            {isDeleting === user.id ? (
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
              setSelectedUser(null)
            }}
            user={selectedUser}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
