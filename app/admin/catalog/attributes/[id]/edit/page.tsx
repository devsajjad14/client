'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi'
import { getAttributes, updateAttribute } from '@/lib/actions/attributes'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface AttributeFormData {
  name: string
  display: string
  values: string[]
  status: 'active' | 'draft' | 'archived'
}

export default function EditAttributePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [formData, setFormData] = useState<AttributeFormData>({
    name: '',
    display: '',
    values: [''],
    status: 'active',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadAttribute()
  }, [resolvedParams.id])

  const loadAttribute = async () => {
    const attributes = await getAttributes()
    const attribute = attributes.find(attr => attr.id === resolvedParams.id)
    if (attribute) {
      setFormData({
        name: attribute.name,
        display: attribute.display,
        values: attribute.values.map(v => v.value),
        status: attribute.status as 'active' | 'draft' | 'archived',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      // When name changes, also update display with the same value
      setFormData(prev => ({ 
        ...prev, 
        name: value,
        display: value // Update display with the same value
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...formData.values]
    newValues[index] = value
    setFormData(prev => ({ ...prev, values: newValues }))
  }

  const addValue = () => {
    setFormData(prev => ({ ...prev, values: [...prev.values, ''] }))
  }

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await updateAttribute(resolvedParams.id, formData)
      if (response.success) {
        router.push('/admin/catalog/attributes')
      } else {
        alert(response.error)
      }
    } catch (error) {
      alert('An error occurred while updating the attribute')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      router.push('/admin/catalog/attributes')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Attribute</h1>
            <p className="text-sm text-gray-500 mt-1">
              Edit product attribute
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm"
            className="text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button 
            size="sm"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Attribute Details */}
        <div className="col-span-8 space-y-6">
          {/* Attribute Name & Display */}
          <Card className="p-8 rounded-xl shadow-md bg-white">
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Attribute Name *
                </label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter attribute name"
                  required
                  className="h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <Input
                  name="display"
                  value={formData.display}
                  onChange={handleInputChange}
                  placeholder="Enter display name"
                  required
                  className="h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </Card>

          {/* Values Section */}
          <Card className="p-8 rounded-xl shadow-md bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Values</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addValue}
                  className="text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Value
                </Button>
              </div>
              <div className="space-y-3">
                {formData.values.map((value, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      placeholder="Enter value"
                      className="h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    {formData.values.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeValue(index)}
                        className="h-10 w-10 p-0 text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="col-span-4">
          {/* Status Card */}
          <Card className="p-8 rounded-xl shadow-md bg-white">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 