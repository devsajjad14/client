'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiCopy, FiCheck, FiEye, FiEyeOff, FiLoader, FiLink, FiKey, FiLock, FiMoreHorizontal } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface ApiIntegration {
  id: number
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
}

export default function EditApiIntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [integration, setIntegration] = useState<ApiIntegration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [showCustomerPassword, setShowCustomerPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)

  useEffect(() => {
    loadIntegration()
  }, [resolvedParams.id])

  const loadIntegration = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/integrations/${resolvedParams.id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch integration')
      }
      const data = await response.json()
      setIntegration(data)
    } catch (error) {
      console.error('Error loading integration:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load integration')
      router.push('/admin/apis')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!integration) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/integrations/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(integration),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update integration')
      }

      toast.success('Integration updated successfully')
      router.push('/admin/apis')
    } catch (error) {
      console.error('Error updating integration:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update integration')
    } finally {
      setIsSaving(false)
    }
  }

  const SensitiveInput = ({ value, onChange, placeholder, label, show, setShow }: SensitiveInputProps) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShow(!show)}
          className="h-8 text-gray-600 hover:text-blue-600"
        >
          {show ? (
            <><FiEyeOff className="h-4 w-4 mr-2" /> Hide</>
          ) : (
            <><FiEye className="h-4 w-4 mr-2" /> Show</>
          )}
        </Button>
      </div>
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 bg-gray-50 border-2 focus:border-blue-500"
      />
    </div>
  )

  if (isLoading || !integration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading integration details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Edit Integration
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                Modify integration details and settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
              <div className="flex items-center gap-2">
                <FiLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Integration Name
                  </label>
                  <Input
                    value={integration.name}
                    onChange={(e) => setIntegration({ ...integration, name: e.target.value })}
                    placeholder="e.g., PayPal Integration"
                    className="h-11 bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Customer Name
                  </label>
                  <Input
                    value={integration.customerName}
                    onChange={(e) => setIntegration({ ...integration, customerName: e.target.value })}
                    placeholder="Enter customer name"
                    className="h-11 bg-white dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Customer Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showCustomerPassword ? 'text' : 'password'}
                      value={integration.customerPassword}
                      onChange={(e) => setIntegration({ ...integration, customerPassword: e.target.value })}
                      placeholder="Enter customer password"
                      className="h-11 bg-white dark:bg-gray-900 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        {showCustomerPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Credentials */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
              <div className="flex items-center gap-2">
                <FiKey className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold">API Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    API Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={integration.apiKey}
                      onChange={(e) => setIntegration({ ...integration, apiKey: e.target.value })}
                      placeholder="Enter API key"
                      className="h-11 bg-white dark:bg-gray-900 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        {showApiKey ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    API Secret
                  </label>
                  <div className="relative">
                    <Input
                      type={showApiSecret ? 'text' : 'password'}
                      value={integration.apiSecret}
                      onChange={(e) => setIntegration({ ...integration, apiSecret: e.target.value })}
                      placeholder="Enter API secret"
                      className="h-11 bg-white dark:bg-gray-900 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        {showApiSecret ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Information */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
              <div className="flex items-center gap-2">
                <FiLock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold">Token Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Token
                  </label>
                  <div className="relative">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      value={integration.token}
                      onChange={(e) => setIntegration({ ...integration, token: e.target.value })}
                      placeholder="Enter token"
                      className="h-11 bg-white dark:bg-gray-900 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowToken(!showToken)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        {showToken ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Refresh Token
                  </label>
                  <div className="relative">
                    <Input
                      type={showRefreshToken ? 'text' : 'password'}
                      value={integration.refreshToken}
                      onChange={(e) => setIntegration({ ...integration, refreshToken: e.target.value })}
                      placeholder="Enter refresh token"
                      className="h-11 bg-white dark:bg-gray-900 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowRefreshToken(!showRefreshToken)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        {showRefreshToken ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
              <div className="flex items-center gap-2">
                <FiMoreHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg font-semibold">Additional Fields</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num}>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Additional Field {num}
                    </label>
                    <Input
                      value={integration.additionalFields[`field${num}`]}
                      onChange={(e) => setIntegration({
                        ...integration,
                        additionalFields: {
                          ...integration.additionalFields,
                          [`field${num}`]: e.target.value
                        }
                      })}
                      placeholder={`Enter additional field ${num}`}
                      className="h-11 bg-white dark:bg-gray-900"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-6"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSaving ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 