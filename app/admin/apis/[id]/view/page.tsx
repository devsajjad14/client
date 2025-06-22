'use client'

import { useState, useEffect, use } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FiArrowLeft, FiCopy, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ApiIntegration {
  id: number
  name: string
  customerName: string
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

export default function ViewApiIntegrationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [integration, setIntegration] = useState<ApiIntegration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)
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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {integration.name}
            </h1>
            <p className="text-gray-500">
              Integration for {integration.customerName}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* API Credentials Section */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <h2 className="text-lg font-medium text-blue-900">API Credentials</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">API Key</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(integration.apiKey, 'apiKey')}
                      className="h-8 text-gray-600 hover:text-blue-600"
                    >
                      {copiedField === 'apiKey' ? (
                        <><FiCheck className="h-4 w-4 mr-2" /> Copied</>
                      ) : (
                        <><FiCopy className="h-4 w-4 mr-2" /> Copy</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-8 text-gray-600 hover:text-blue-600"
                    >
                      {showApiKey ? (
                        <><FiEyeOff className="h-4 w-4 mr-2" /> Hide</>
                      ) : (
                        <><FiEye className="h-4 w-4 mr-2" /> Show</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  {showApiKey ? integration.apiKey : '••••••••••••'}
                </div>
              </div>

              {/* API Secret */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">API Secret</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(integration.apiSecret, 'apiSecret')}
                      className="h-8 text-gray-600 hover:text-blue-600"
                    >
                      {copiedField === 'apiSecret' ? (
                        <><FiCheck className="h-4 w-4 mr-2" /> Copied</>
                      ) : (
                        <><FiCopy className="h-4 w-4 mr-2" /> Copy</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="h-8 text-gray-600 hover:text-blue-600"
                    >
                      {showApiSecret ? (
                        <><FiEyeOff className="h-4 w-4 mr-2" /> Hide</>
                      ) : (
                        <><FiEye className="h-4 w-4 mr-2" /> Show</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  {showApiSecret ? integration.apiSecret : '••••••••••••'}
                </div>
              </div>
            </div>
          </Card>

          {/* Token Information Section */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-medium text-green-900">Token Information</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Access Token */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Access Token</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(integration.token, 'token')}
                      className="h-8 text-gray-600 hover:text-green-600"
                    >
                      {copiedField === 'token' ? (
                        <><FiCheck className="h-4 w-4 mr-2" /> Copied</>
                      ) : (
                        <><FiCopy className="h-4 w-4 mr-2" /> Copy</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowToken(!showToken)}
                      className="h-8 text-gray-600 hover:text-green-600"
                    >
                      {showToken ? (
                        <><FiEyeOff className="h-4 w-4 mr-2" /> Hide</>
                      ) : (
                        <><FiEye className="h-4 w-4 mr-2" /> Show</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  {showToken ? integration.token : '••••••••••••'}
                </div>
              </div>

              {/* Refresh Token */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Refresh Token</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(integration.refreshToken, 'refreshToken')}
                      className="h-8 text-gray-600 hover:text-green-600"
                    >
                      {copiedField === 'refreshToken' ? (
                        <><FiCheck className="h-4 w-4 mr-2" /> Copied</>
                      ) : (
                        <><FiCopy className="h-4 w-4 mr-2" /> Copy</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRefreshToken(!showRefreshToken)}
                      className="h-8 text-gray-600 hover:text-green-600"
                    >
                      {showRefreshToken ? (
                        <><FiEyeOff className="h-4 w-4 mr-2" /> Hide</>
                      ) : (
                        <><FiEye className="h-4 w-4 mr-2" /> Show</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  {showRefreshToken ? integration.refreshToken : '••••••••••••'}
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Fields Section */}
          {Object.values(integration.additionalFields).some(value => value) && (
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                <h2 className="text-lg font-medium text-purple-900">Additional Fields</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  {Object.entries(integration.additionalFields).map(([key, value]) => (
                    value && (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-900">{value}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 