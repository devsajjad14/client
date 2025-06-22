'use client'

import { useEffect, useState, use } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FiArrowLeft, FiEdit2, FiTag, FiLoader } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { getAttribute } from '@/lib/actions/attributes'

interface Attribute {
  id: string
  name: string
  display: string
  status: 'active' | 'draft' | 'archived'
  createdAt: string
  values: { value: string }[]
}

export default function AttributeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [attribute, setAttribute] = useState<Attribute | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAttribute()
  }, [resolvedParams.id])

  const loadAttribute = async () => {
    setIsLoading(true)
    try {
      const data = await getAttribute(resolvedParams.id)
      setAttribute(data)
    } catch (error) {
      console.error('Error loading attribute:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!attribute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Attribute not found</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{attribute.name}</h1>
            <p className="text-sm text-gray-500 mt-1">View attribute details</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/admin/catalog/attributes/${attribute.id}/edit`)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <FiEdit2 className="mr-2 h-4 w-4" />
          Edit Attribute
        </Button>
      </div>

      {/* Attribute Details */}
      <div className="grid grid-cols-1 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-sm text-gray-900">{attribute.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Display Name</label>
              <p className="mt-1 text-sm text-gray-900">{attribute.display}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                ${attribute.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : attribute.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
                }`}
              >
                {attribute.status.charAt(0).toUpperCase() + attribute.status.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(attribute.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Values */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Values</h2>
          <div className="flex flex-wrap gap-2">
            {attribute.values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                <FiTag className="h-4 w-4 mr-1.5 text-gray-500" />
                {value.value}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
} 