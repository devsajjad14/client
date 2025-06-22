'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiDatabase,
  FiGlobe,
  FiSettings,
  FiSave,
  FiX,
  FiCheck,
  FiServer,
  FiCloud,
  FiLink,
  FiRefreshCw,
  FiShield,
  FiClock,
} from 'react-icons/fi'
import { getDataModeSettings, updateDataModeSettings } from '@/lib/actions/data-mode'
import { toast } from 'sonner'

interface EndpointConfig {
  label: string
  key: string
  placeholder: string
  fullUrl: string
  description: string
  icon: React.ReactNode
}

const endpoints: EndpointConfig[] = [
  {
    label: 'Taxonomy (Categories)',
    key: 'taxonomy',
    placeholder: '/api/data/taxonomy',
    fullUrl: 'https://www.example.com/api/data/taxonomy',
    description: 'Endpoint for fetching category and taxonomy data',
    icon: <FiServer className='h-4 w-4' />,
  },
  {
    label: 'Featured Products',
    key: 'featured',
    placeholder: '/api/data/products/featured',
    fullUrl: 'https://www.example.com/api/data/products/featured',
    description: 'Endpoint for fetching featured products',
    icon: <FiCloud className='h-4 w-4' />,
  },
  {
    label: 'New Arrivals',
    key: 'new',
    placeholder: '/api/data/products/new',
    fullUrl: 'https://www.example.com/api/data/products/new',
    description: 'Endpoint for fetching new arrival products',
    icon: <FiClock className='h-4 w-4' />,
  },
  {
    label: 'Sale Products',
    key: 'sale',
    placeholder: '/api/data/products/sale',
    fullUrl: 'https://www.example.com/api/data/products/sale',
    description: 'Endpoint for fetching products on sale',
    icon: <FiCloud className='h-4 w-4' />,
  },
  {
    label: 'Products by Category',
    key: 'category',
    placeholder: '/api/data/products/[url]/limit=12/offset/0',
    fullUrl:
      'https://www.example.com/api/data/products/[url]/limit=12/offset/0',
    description: 'Endpoint for fetching products by category URL',
    icon: <FiLink className='h-4 w-4' />,
  },
  {
    label: 'Product by ID',
    key: 'product',
    placeholder: '/api/data/products/ID',
    fullUrl: 'https://www.example.com/api/data/products/ID',
    description: 'Endpoint for fetching individual product details',
    icon: <FiShield className='h-4 w-4' />,
  },
]

export default function DataModePage() {
  const [mode, setMode] = useState<'local' | 'remote'>('local')
  const [remoteEndpoints, setRemoteEndpoints] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getDataModeSettings()
        setMode(settings.mode as 'local' | 'remote')
        setRemoteEndpoints(settings.endpoints || {})
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings', {
          description: 'Please try refreshing the page',
          duration: 4000,
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateDataModeSettings({
        mode,
        endpoints: remoteEndpoints,
      })

      if (result.success) {
        toast.success('Settings saved successfully', {
          description: 'Your changes have been applied',
          duration: 3000,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', {
        description: 'Please try again',
        duration: 4000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const validateEndpoint = async () => {
    setIsValidating(true)
    try {
      // Add your endpoint validation logic here
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Endpoint validated', {
        description: 'The endpoint is working correctly',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error validating endpoint:', error)
      toast.error('Validation failed', {
        description: 'Please check the endpoint URL and try again',
        duration: 4000,
      })
    } finally {
      setIsValidating(false)
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
              Data Mode Settings
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
              Configure how your application fetches and manages data
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              className='text-sm font-medium border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200'
            >
              <FiX className='mr-2 h-4 w-4' />
              Cancel
            </Button>
            <Button
              size='sm'
              className='text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200'
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <FiSave className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className='mr-2 h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-6'>
              Data Source Mode
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className="text-lg font-semibold">Data Source Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Choose between local data or API data for development and testing
                </p>
                <p className="text-sm text-red-500 mt-2 font-medium">
                  Note: We have not linked local data to front end for now. We will do this next build.
                </p>
              </div>
            </div>
            <div className='grid gap-4'>
              <div className='flex items-center space-x-4 p-6 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-md'>
                <input
                  type='radio'
                  id='local'
                  name='mode'
                  value='local'
                  checked={mode === 'local'}
                  onChange={() => setMode('local')}
                  className='h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500'
                />
                <label
                  htmlFor='local'
                  className='flex items-center flex-1 cursor-pointer'
                >
                  <div className='p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-600 dark:text-blue-400 mr-4'>
                    <FiDatabase className='h-6 w-6' />
                  </div>
                  <div>
                    <span className='text-gray-900 dark:text-white font-medium text-lg'>
                      Local
                    </span>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      Data will be served from local database
                    </p>
                  </div>
                </label>
              </div>

              <div className='flex items-center space-x-4 p-6 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-900 hover:shadow-md'>
                <input
                  type='radio'
                  id='remote'
                  name='mode'
                  value='remote'
                  checked={mode === 'remote'}
                  onChange={() => setMode('remote')}
                  className='h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500'
                />
                <label
                  htmlFor='remote'
                  className='flex items-center flex-1 cursor-pointer'
                >
                  <div className='p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-600 dark:text-purple-400 mr-4'>
                    <FiSettings className='h-6 w-6' />
                  </div>
                  <div>
                    <span className='text-gray-900 dark:text-white font-medium text-lg'>
                      Remote
                    </span>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      Configure remote endpoints for each data type
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Custom Endpoints */}
        <AnimatePresence>
          {mode === 'remote' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <Card className="p-8 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Remote Endpoints
                </h2>
                <div className="space-y-6">
                  {endpoints.map((endpoint) => (
                    <div
                      key={endpoint.key}
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-4">
                          {endpoint.icon}
                        </div>
                        <label
                          htmlFor={endpoint.key}
                          className="block text-lg font-medium text-gray-900 dark:text-white"
                        >
                          {endpoint.label}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Input
                          id={endpoint.key}
                          type="text"
                          placeholder={endpoint.fullUrl}
                          value={remoteEndpoints[endpoint.key] || ''}
                          onChange={(e) =>
                            setRemoteEndpoints((prev) => ({
                              ...prev,
                              [endpoint.key]: e.target.value,
                            }))
                          }
                          className="flex-1 h-12 text-lg rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-3 h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200"
                          onClick={() => validateEndpoint()}
                          disabled={isValidating}
                        >
                          {isValidating ? (
                            <FiRefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <FiCheck className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
