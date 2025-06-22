import { useState } from 'react'
import { FiChevronRight, FiChevronDown, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import Link from 'next/link'

interface Category {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
}

interface CategoryTreeProps {
  categories: Category[]
  onDelete: (id: number) => void
}

export function CategoryTree({ categories, onDelete }: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCategories(newExpanded)
  }

  // Group categories by their hierarchy level
  const groupedCategories = categories.reduce((acc, category) => {
    const key = category.DEPT
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(category)
    return acc
  }, {} as Record<string, Category[]>)

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.WEB_TAXONOMY_ID)
    const hasChildren = categories.some(
      c => c.DEPT === category.DEPT && 
           c.TYP !== 'EMPTY' && 
           (level === 0 ? c.TYP !== 'EMPTY' : 
            level === 1 ? c.SUBTYP_1 !== 'EMPTY' : 
            level === 2 ? c.SUBTYP_2 !== 'EMPTY' : 
            c.SUBTYP_3 !== 'EMPTY')
    )

    const displayName = level === 0 ? category.DEPT :
                       level === 1 ? category.TYP :
                       level === 2 ? category.SUBTYP_1 :
                       level === 3 ? category.SUBTYP_2 :
                       category.SUBTYP_3

    return (
      <div key={category.WEB_TAXONOMY_ID} className="ml-4">
        <div className="flex items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2">
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.WEB_TAXONOMY_ID)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </button>
          )}
          <span className="flex-1 ml-2">{displayName}</span>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/catalog/categories/edit/${category.WEB_TAXONOMY_ID}`}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
            >
              <FiEdit2 />
            </Link>
            <button
              onClick={() => onDelete(category.WEB_TAXONOMY_ID)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
            >
              <FiTrash2 />
            </button>
            <Link
              href={`/admin/catalog/categories/add?parent=${category.WEB_TAXONOMY_ID}`}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-green-600 dark:text-green-400"
            >
              <FiPlus />
            </Link>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {categories
              .filter(c => 
                c.DEPT === category.DEPT && 
                (level === 0 ? c.TYP !== 'EMPTY' : 
                 level === 1 ? c.SUBTYP_1 !== 'EMPTY' : 
                 level === 2 ? c.SUBTYP_2 !== 'EMPTY' : 
                 c.SUBTYP_3 !== 'EMPTY')
              )
              .map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
      </div>
      <div className="p-4">
        {Object.entries(groupedCategories).map(([dept, deptCategories]) => (
          <div key={dept}>
            {deptCategories
              .filter(c => c.TYP === 'EMPTY')
              .map(category => renderCategory(category))}
          </div>
        ))}
      </div>
    </div>
  )
} 