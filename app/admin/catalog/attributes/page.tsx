'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiChevronDown,
  FiTag,
  FiLoader,
} from 'react-icons/fi'
import { getAttributes, deleteAttribute } from '@/lib/actions/attributes'
import { useRouter } from 'next/navigation'

interface Attribute {
  id: string
  name: string
  display: string
  status: 'active' | 'draft' | 'archived'
  createdAt: string
  values: { value: string }[]
}

export default function AttributesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAttributes()
  }, [])

  const loadAttributes = async () => {
    setIsLoading(true)
    try {
      const data = await getAttributes()
      setAttributes(data)
    } catch (error) {
      console.error('Error loading attributes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      const response = await deleteAttribute(id)
      if (response.success) {
        loadAttributes()
      } else {
        alert(response.error)
      }
    }
  }

  const filteredAttributes = attributes.filter(attr => 
    attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attr.display.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attributes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product attributes and options
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => router.push('/admin/catalog/attributes/add')}
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Attribute
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9 px-3 text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filters
            <FiChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Attributes List */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attribute
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Values
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8">
                    <div className="flex items-center justify-center text-gray-500">
                      <FiLoader className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading attributes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No attributes found
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((attribute) => (
                  <tr key={attribute.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FiTag className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="font-medium text-gray-900">{attribute.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {attribute.display}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {attribute.values.slice(0, 3).map((value, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {value.value}
                          </span>
                        ))}
                        {attribute.values.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{attribute.values.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${attribute.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : attribute.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {attribute.status.charAt(0).toUpperCase() + attribute.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-500"
                          onClick={() => router.push(`/admin/catalog/attributes/${attribute.id}`)}
                        >
                          <FiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-500"
                          onClick={() => router.push(`/admin/catalog/attributes/${attribute.id}/edit`)}
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => handleDelete(attribute.id)}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 