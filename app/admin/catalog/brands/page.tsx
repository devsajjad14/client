'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiArrowLeft,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { getBrands, deleteBrand } from '@/lib/actions/brands'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Brand {
  id: number
  name: string
  alias: string
  description: string | null
  urlHandle: string
  logo: string | null
  showOnCategory: boolean
  showOnProduct: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export default function BrandsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12) // Show 12 brands per page

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await getBrands()
      if (response.success && response.data) {
        const sortedBrands = response.data.sort((a, b) => a.name.localeCompare(b.name))
        setBrands(
          sortedBrands.map((brand) => ({
            ...brand,
            createdAt: brand.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: brand.updatedAt?.toISOString() || new Date().toISOString(),
          }))
        )
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch brands',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch brands',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!brandToDelete) return

    try {
      const response = await deleteBrand(brandToDelete.id)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Brand deleted successfully',
        })
        setBrands((prev) =>
          prev.filter((brand) => brand.id !== brandToDelete.id)
        )
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete brand',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setBrandToDelete(null)
    }
  }

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.alias.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-4'>
            <FiLoader className='w-8 h-8 animate-spin text-gray-400' />
            <p className='text-sm text-gray-500'>Loading brands...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10">
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredBrands.length} total brands
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={() => router.push('/admin/catalog/brands/add')}
        >
          <FiPlus className='mr-2' />
          Add Brand
        </Button>
      </div>

      <Card className="p-4 rounded-xl shadow-sm bg-white">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder='Search brands by name or alias...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-base border-gray-200 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentItems.map((brand) => (
          <Card key={brand.id} className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="p-4 flex-grow">
              <div className="flex items-start gap-4">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1 border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    No logo
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900">{brand.name}</h3>
                  <p className="text-sm text-gray-500">{brand.alias}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                    {brand.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {brand.showOnCategory && <Badge variant='outline'>Category</Badge>}
                  {brand.showOnProduct && <Badge variant='outline'>Product</Badge>}
                </div>
              </div>
            </div>
            <div className="p-2 border-t bg-gray-50/50 rounded-b-xl">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/catalog/brands/edit/${brand.id}`)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                  <FiEdit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setBrandToDelete(brand)
                    setDeleteDialogOpen(true)
                  }}
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {currentItems.length > 0 && (
        <Pagination totalPages={totalPages} currentPage={currentPage} paginate={paginate} />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-500 hover:bg-red-600'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const Pagination = ({ totalPages, currentPage, paginate }: { totalPages: number, currentPage: number, paginate: (page: number) => void }) => {
  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pageNumbers
  }

  const pages = getPageNumbers()

  return (
    <div className="flex justify-center items-center mt-8">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">First</span>
          <FiChevronsLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Previous</span>
          <FiChevronLeft className="h-5 w-5" />
        </button>
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => paginate(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          )
        )}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Next</span>
          <FiChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Last</span>
          <FiChevronsRight className="h-5 w-5" />
        </button>
      </nav>
    </div>
  )
} 