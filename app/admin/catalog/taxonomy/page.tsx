'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  SORT_POSITION: string | null
  WEB_URL: string
  LONG_DESCRIPTION: string | null
  DLU: string
  CATEGORY_STYLE: string | null
  SHORT_DESC: string
  LONG_DESCRIPTION_2: string
  META_TAGS: string | null
  ACTIVE: number
  BACKGROUNDIMAGE: string | null
  SHORT_DESC_ON_PAGE: string | null
  GOOGLEPRODUCTTAXONOMY: string
  SITE: number
  CATEGORYTEMPLATE: string | null
  BESTSELLERBG: string | null
  NEWARRIVALBG: string | null
  PAGEBGCOLOR: string | null
}

export default function TaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const response = await fetch('/api/admin/catalog/categories')
        if (!response.ok) throw new Error('Failed to fetch taxonomy')
        const data = await response.json()
        setTaxonomy(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching taxonomy:', error)
        setError('Failed to fetch taxonomy. Please try again later.')
        toast({
          title: 'Error',
          description: 'Failed to fetch taxonomy data',
          variant: 'destructive',
        })
      }
    }
    fetchTaxonomy()
  }, [toast])

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
            <h1 className='text-2xl font-bold text-gray-900'>Taxonomy</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Manage your product taxonomy structure
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
      <Card className='p-6'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subtype 1</TableHead>
                <TableHead>Subtype 2</TableHead>
                <TableHead>Subtype 3</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxonomy.map((item) => (
                <TableRow key={item.WEB_TAXONOMY_ID}>
                  <TableCell>{item.WEB_TAXONOMY_ID}</TableCell>
                  <TableCell>{item.DEPT}</TableCell>
                  <TableCell>{item.TYP === 'EMPTY' ? '-' : item.TYP}</TableCell>
                  <TableCell>{item.SUBTYP_1 === 'EMPTY' ? '-' : item.SUBTYP_1}</TableCell>
                  <TableCell>{item.SUBTYP_2 === 'EMPTY' ? '-' : item.SUBTYP_2}</TableCell>
                  <TableCell>{item.SUBTYP_3 === 'EMPTY' ? '-' : item.SUBTYP_3}</TableCell>
                  <TableCell>{item.WEB_URL}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.ACTIVE === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.ACTIVE === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(item.DLU).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
} 