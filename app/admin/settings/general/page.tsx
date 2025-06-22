'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  FiSettings,
  FiGlobe,
  FiShoppingBag,
  FiUpload,
  FiImage,
  FiDroplet,
  FiX,
  FiMinus,
} from 'react-icons/fi'
import { useEffect, useState, useRef } from 'react'
import { getSettings, updateMultipleSettings, updateSetting } from '@/lib/actions/settings'
import { toast, Toaster } from 'sonner'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    siteTitle: '',
    description: '',
    keywords: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#8B5CF6',
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    logo: '',
    favicon: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  // Temporary storage for new images before upload
  const [tempLogo, setTempLogo] = useState<File | null>(null)
  const [tempFavicon, setTempFavicon] = useState<File | null>(null)
  const [tempLogoPreview, setTempLogoPreview] = useState<string>('')
  const [tempFaviconPreview, setTempFaviconPreview] = useState<string>('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading settings...')
        const generalSettings = await getSettings('general')
        const colorSettings = await getSettings('colors')
        const storeSettings = await getSettings('store')
        const brandingSettings = await getSettings('branding')
        
        console.log('Loaded settings:', {
          general: generalSettings,
          colors: colorSettings,
          store: storeSettings,
          branding: brandingSettings,
        })

        setSettings(prev => ({
          ...prev,
          ...generalSettings,
          ...colorSettings,
          ...storeSettings,
          ...brandingSettings,
        }))
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleFaviconClick = () => {
    faviconInputRef.current?.click()
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/upload/site-asset', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`)
      }
      
      const result = await response.json()
      
      // Update the settings with the new URL
      setSettings(prev => ({
        ...prev,
        [type]: result.url
      }))
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`)
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(`Failed to upload ${type}`)
    }
  }

  const handleRemoveImage = async (type: 'logo' | 'favicon') => {
    try {
      const currentUrl = settings[type]
      if (!currentUrl) return
      
      // Extract filename from URL
      const urlParts = currentUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      
      // Delete from Vercel Blob
      const response = await fetch(`/api/upload/site-asset?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        console.warn(`Failed to delete ${type} from blob storage`)
      }
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [type]: ''
      }))
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`)
    } catch (error) {
      console.error(`Error removing ${type}:`, error)
      toast.error(`Failed to remove ${type}`)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setIsUploading(false)
    
    try {
      // Upload images first if there are new ones
      let logoUrl = settings.logo
      let faviconUrl = settings.favicon
      
      if (tempLogo) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', tempLogo)
        formData.append('type', 'logo')
        
        const response = await fetch('/api/upload/site-asset', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload logo')
        }
        
        const result = await response.json()
        logoUrl = result.url
        setIsUploading(false)
      }
      
      if (tempFavicon) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', tempFavicon)
        formData.append('type', 'favicon')
        
        const response = await fetch('/api/upload/site-asset', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload favicon')
        }
        
        const result = await response.json()
        faviconUrl = result.url
        setIsUploading(false)
      }
      
      // Update settings with new image URLs
      const updatedSettings = {
        ...settings,
        logo: logoUrl,
        favicon: faviconUrl,
      }
      
      // Save settings using the original working function
      const result = await updateMultipleSettings({
        siteTitle: updatedSettings.siteTitle,
        description: updatedSettings.description,
        keywords: updatedSettings.keywords,
        primaryColor: updatedSettings.primaryColor,
        secondaryColor: updatedSettings.secondaryColor,
        accentColor: updatedSettings.accentColor,
        storeName: updatedSettings.storeName,
        storeEmail: updatedSettings.storeEmail,
        storePhone: updatedSettings.storePhone,
        storeAddress: updatedSettings.storeAddress,
        logo: updatedSettings.logo,
        favicon: updatedSettings.favicon,
      })

      if (result.success) {
        // Update local state
        setSettings(updatedSettings)
        
        // Clean up temporary files and previews
        if (tempLogo) {
          URL.revokeObjectURL(tempLogoPreview)
          setTempLogo(null)
          setTempLogoPreview('')
        }
        
        if (tempFavicon) {
          URL.revokeObjectURL(tempFaviconPreview)
          setTempFavicon(null)
          setTempFaviconPreview('')
        }
        
        // Clear file inputs
        if (logoInputRef.current) {
          logoInputRef.current.value = ''
        }
        if (faviconInputRef.current) {
          faviconInputRef.current.value = ''
        }
        
        toast.success('Settings saved successfully', {
          description: 'Your changes have been saved and will be reflected immediately.',
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
            border: 'none',
          },
        })
        
        // Reload settings after successful save
        const generalSettings = await getSettings('general')
        const colorSettings = await getSettings('colors')
        const storeSettings = await getSettings('store')
        const brandingSettings = await getSettings('branding')
        
        setSettings(prev => ({
          ...prev,
          ...generalSettings,
          ...colorSettings,
          ...storeSettings,
          ...brandingSettings,
        }))
      } else {
        toast.error('Failed to save settings', {
          description: result.error || 'There was an error saving your changes. Please try again.',
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: 'white',
            border: 'none',
          },
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', {
        description: 'An unexpected error occurred. Please try again later.',
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
          border: 'none',
        },
      })
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className='space-y-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen'>
      <Toaster position="top-right" richColors />
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
            General Settings
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
            Configure your store&#39;s core settings and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : isUploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading Images...</span>
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Branding Section */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-2 mb-6'>
          <FiSettings className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>General Settings</h1>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Logo Upload */}
          <div className='space-y-4'>
            <Label className='text-lg'>Store Logo</Label>
            <div className='flex items-center space-x-6'>
              <div 
                onClick={handleLogoClick}
                className='w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors cursor-pointer relative overflow-hidden'
              >
                {(tempLogoPreview || settings.logo) ? (
                  <div className="relative w-full h-full">
                    <img
                      src={tempLogoPreview || settings.logo}
                      alt="Store Logo"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTempLogo(null)
                        setTempLogoPreview('')
                        setSettings(prev => ({ ...prev, logo: '' }))
                        if (logoInputRef.current) {
                          logoInputRef.current.value = ''
                        }
                      }}
                      className="absolute -top-1 -right-1 text-red-500 hover:text-red-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className='text-center'>
                    <FiUpload className='mx-auto h-8 w-8 text-gray-400' />
                    <span className='mt-2 block text-sm text-gray-500 dark:text-gray-400'>
                      Upload Logo
                    </span>
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Recommended size: 200x200px. Max file size: 2MB
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={logoInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Validate file size
                  const maxSize = 2 * 1024 * 1024 // 2MB for logo
                  if (file.size > maxSize) {
                    toast.error('Logo size should be less than 2MB')
                    return
                  }

                  // Validate file type
                  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                  if (!allowedTypes.includes(file.type)) {
                    toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                    return
                  }

                  // Store file temporarily and create preview
                  setTempLogo(file)
                  const tempUrl = URL.createObjectURL(file)
                  setTempLogoPreview(tempUrl)
                }
              }}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Favicon Upload */}
          <div className='space-y-4'>
            <Label className='text-lg'>Favicon</Label>
            <div className='flex items-center space-x-6'>
              <div 
                onClick={handleFaviconClick}
                className='w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors cursor-pointer relative overflow-hidden'
              >
                {(tempFaviconPreview || settings.favicon) ? (
                  <div className="relative w-full h-full">
                    <img
                      src={tempFaviconPreview || settings.favicon}
                      alt="Favicon"
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTempFavicon(null)
                        setTempFaviconPreview('')
                        setSettings(prev => ({ ...prev, favicon: '' }))
                        if (faviconInputRef.current) {
                          faviconInputRef.current.value = ''
                        }
                      }}
                      className="absolute -top-1 -right-1 text-red-500 hover:text-red-600"
                    >
                      <FiX className="w-2 h-2" />
                    </button>
                  </div>
                ) : (
                  <div className='text-center'>
                    <FiUpload className='mx-auto h-6 w-6 text-gray-400' />
                    <span className='mt-1 block text-xs text-gray-500 dark:text-gray-400'>
                      Upload Favicon
                    </span>
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Recommended size: 32x32px. Max file size: 1MB
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={faviconInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Validate file size
                  const maxSize = 1 * 1024 * 1024 // 1MB for favicon
                  if (file.size > maxSize) {
                    toast.error('Favicon size should be less than 1MB')
                    return
                  }

                  // Validate file type
                  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                  if (!allowedTypes.includes(file.type)) {
                    toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                    return
                  }

                  // Store file temporarily and create preview
                  setTempFavicon(file)
                  const tempUrl = URL.createObjectURL(file)
                  setTempFaviconPreview(tempUrl)
                }
              }}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Site Information */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30'>
            <FiGlobe className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          </div>
          <h2 className='text-2xl font-semibold'>Site Information</h2>
        </div>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label className='text-lg'>Site Title</Label>
            <Input
              value={settings.siteTitle}
              onChange={(e) =>
                setSettings({ ...settings, siteTitle: e.target.value })
              }
              placeholder='Enter your site title'
              className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Meta Description</Label>
            <textarea
              value={settings.description}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              rows={3}
              placeholder='Enter your site description'
              className='w-full rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 p-3 text-base'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Keywords</Label>
            <Input
              value={settings.keywords}
              onChange={(e) =>
                setSettings({ ...settings, keywords: e.target.value })
              }
              placeholder='Enter keywords separated by commas'
              className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
            />
          </div>
        </div>
      </Card>

      {/* Color Settings */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30'>
            <FiDroplet className='w-6 h-6 text-purple-600 dark:text-purple-400' />
          </div>
          <h2 className='text-2xl font-semibold'>Color Settings</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='space-y-2'>
            <Label className='text-lg'>Primary Color</Label>
            <div className='flex items-center gap-2'>
              <input
                type='color'
                value={settings.primaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className='h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 cursor-pointer'
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Secondary Color</Label>
            <div className='flex items-center gap-2'>
              <input
                type='color'
                value={settings.secondaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className='h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 cursor-pointer'
              />
              <Input
                value={settings.secondaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Accent Color</Label>
            <div className='flex items-center gap-2'>
              <input
                type='color'
                value={settings.accentColor}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
                className='h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 cursor-pointer'
              />
              <Input
                value={settings.accentColor}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
                className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Store Information */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 rounded-xl bg-green-100 dark:bg-green-900/30'>
            <FiShoppingBag className='w-6 h-6 text-green-600 dark:text-green-400' />
          </div>
          <h2 className='text-2xl font-semibold'>Store Information</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label className='text-lg'>Store Name</Label>
            <Input
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
              placeholder='Enter store name'
              className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Store Email</Label>
            <Input
              type='email'
              value={settings.storeEmail}
              onChange={(e) =>
                setSettings({ ...settings, storeEmail: e.target.value })
              }
              placeholder='store@example.com'
              className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Phone Number</Label>
            <Input
              type='tel'
              value={settings.storePhone}
              onChange={(e) =>
                setSettings({ ...settings, storePhone: e.target.value })
              }
              placeholder='+1 (555) 000-0000'
              className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-lg'>Store Address</Label>
            <Input
              value={settings.storeAddress}
              onChange={(e) =>
                setSettings({ ...settings, storeAddress: e.target.value })
              }
              placeholder='Enter store address'
              className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
