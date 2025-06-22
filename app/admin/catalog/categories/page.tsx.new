'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FiArrowLeft, FiPlus, FiChevronRight, FiChevronDown, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'
import { CategoryDetailsModal } from './components/CategoryDetailsModal'
import { useRouter } from 'next/navigation'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
}

interface CategoryNode {
  id: number
  name: string
  url: string
  active: number
  children: CategoryNode[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/catalog/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data)
        setError(null)
      } catch (error) {
        setError('Failed to fetch categories. Please try again later.')
        toast({
          title: 'Error',
          description: 'Failed to fetch categories data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [toast])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/catalog/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete category')

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })

      // Refresh the categories list
      const updatedResponse = await fetch('/api/admin/catalog/categories')
      const updatedData = await updatedResponse.json()
      setCategories(updatedData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  const buildCategoryTree = (items: TaxonomyItem[]): CategoryNode[] => {
    const nodeMap = new Map<number, CategoryNode>()
    const rootNodes: CategoryNode[] = []

    // First pass: Create all nodes
    items.forEach(item => {
      const node: CategoryNode = {
        id: item.WEB_TAXONOMY_ID,
        name: '',  // We'll set the name based on the level
        url: item.WEB_URL,
        active: item.ACTIVE,
        children: []
      }
      nodeMap.set(item.WEB_TAXONOMY_ID, node)
    })

    // Second pass: Build hierarchy and set names
    items.forEach(item => {
      const node = nodeMap.get(item.WEB_TAXONOMY_ID)!
      
      // Check from deepest level first
      if (item.SUBTYP_3 !== 'EMPTY' && item.SUBTYP_3 !== '') {
        node.name = item.SUBTYP_3
        // Find parent SUBTYP_2
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === item.TYP && 
          p.SUBTYP_1 === item.SUBTYP_1 && 
          p.SUBTYP_2 === item.SUBTYP_2 && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else if (item.SUBTYP_2 !== 'EMPTY' && item.SUBTYP_2 !== '') {
        node.name = item.SUBTYP_2
        // Find parent SUBTYP_1
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === item.TYP && 
          p.SUBTYP_1 === item.SUBTYP_1 && 
          p.SUBTYP_2 === 'EMPTY' && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else if (item.SUBTYP_1 !== 'EMPTY' && item.SUBTYP_1 !== '') {
        node.name = item.SUBTYP_1
        // Find parent TYP
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === item.TYP && 
          p.SUBTYP_1 === 'EMPTY' && 
          p.SUBTYP_2 === 'EMPTY' && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else if (item.TYP !== 'EMPTY' && item.TYP !== '') {
        node.name = item.TYP
        // Find parent DEPT
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === 'EMPTY' && 
          p.SUBTYP_1 === 'EMPTY' && 
          p.SUBTYP_2 === 'EMPTY' && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else {
        // This is a department node
        node.name = item.DEPT
        rootNodes.push(node)
      }
    })

    // Sort the tree
    const sortTree = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach(node => sortTree(node.children))
    }
    sortTree(rootNodes)

    return rootNodes
  }

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const renderCategoryNode = (node: CategoryNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0

    // Calculate progressive indentation based on level
    const getIndentation = (level: number) => {
      switch(level) {
        case 0: return ''; // Department level - no indentation
        case 1: return 'ml-8'; // Type level
        case 2: return 'ml-16'; // SUBTYP_1 level
        case 3: return 'ml-24'; // SUBTYP_2 level
        case 4: return 'ml-32'; // SUBTYP_3 level
        default: return 'ml-32'; // Any deeper levels
      }
    }

    return (
      <div key={node.id} className={`space-y-2 ${level > 0 ? 'mt-2' : ''}`}>
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
            level === 0 
              ? 'bg-white border border-gray-200 shadow-sm hover:shadow-md' 
              : level === 1 
              ? 'bg-gray-50/80 hover:bg-gray-100/80 border-l-4 border-l-blue-500' 
              : 'bg-white/80 hover:bg-gray-50/80 border-l-4 border-l-indigo-400'
          } ${getIndentation(level)}`}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className={`p-1.5 rounded-full transition-colors duration-200 ${
                level === 0 
                  ? 'hover:bg-gray-100' 
                  : level === 1 
                  ? 'hover:bg-blue-50' 
                  : 'hover:bg-indigo-50'
              }`}
            >
              {isExpanded ? (
                <FiChevronDown className={`h-4 w-4 ${
                  level === 0 
                    ? 'text-gray-600' 
                    : level === 1 
                    ? 'text-blue-600' 
                    : 'text-indigo-600'
                }`} />
              ) : (
                <FiChevronRight className={`h-4 w-4 ${
                  level === 0 
                    ? 'text-gray-600' 
                    : level === 1 
                    ? 'text-blue-600' 
                    : 'text-indigo-600'
                }`} />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <div className="flex-1 flex items-center gap-3">
            <span className={`font-medium ${
              level === 0 
                ? 'text-gray-900' 
                : level === 1 
                ? 'text-blue-900' 
                : 'text-indigo-900'
            }`}>
              {node.name}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                node.active === 1
                  ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
              }`}
            >
              {node.active === 1 ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedCategoryId(node.id)}
              className={`h-8 w-8 ${
                level === 0 
                  ? 'hover:bg-gray-100' 
                  : level === 1 
                  ? 'hover:bg-blue-50' 
                  : 'hover:bg-indigo-50'
              }`}
            >
              <FiEye className={`h-4 w-4 ${
                level === 0 
                  ? 'text-gray-600' 
                  : level === 1 
                  ? 'text-blue-600' 
                  : 'text-indigo-600'
              }`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/catalog/categories/${node.id}/edit`)}
              className={`h-8 w-8 ${
                level === 0 
                  ? 'hover:bg-gray-100' 
                  : level === 1 
                  ? 'hover:bg-blue-50' 
                  : 'hover:bg-indigo-50'
              }`}
            >
              <FiEdit2 className={`h-4 w-4 ${
                level === 0 
                  ? 'text-gray-600' 
                  : level === 1 
                  ? 'text-blue-600' 
                  : 'text-indigo-600'
              }`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(node.id)}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="relative">
            {level === 0 && (
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
            )}
            <div className="space-y-2">
              {node.children.map(child => renderCategoryNode(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const categoryTree = buildCategoryTree(categories)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => window.history.back()}
          >
            <FiArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Categories</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Manage your product categories
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            size='sm'
            className='text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            onClick={() => window.location.href = '/admin/catalog/categories/add'}
          >
            <FiPlus className='h-4 w-4 mr-2' />
            Add Category
          </Button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'>
          {error}
        </div>
      )}

      {/* Main Content */}
      <Card className='p-6 bg-gray-50/50'>
        <div className='space-y-3'>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Loading categories...</p>
              </div>
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg border border-gray-200">
              No categories found
            </div>
          ) : (
            categoryTree.map(node => renderCategoryNode(node))
          )}
        </div>
      </Card>

      {/* Category Details Modal */}
      <CategoryDetailsModal
        isOpen={selectedCategoryId !== null}
        onClose={() => setSelectedCategoryId(null)}
        categoryId={selectedCategoryId}
      />
    </div>
  )
} 