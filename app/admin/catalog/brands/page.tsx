'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi'
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

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await getBrands()
      if (response.success && response.data) {
        setBrands(
          response.data.map((brand) => ({
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
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Brands</h1>
        <Button onClick={() => router.push('/admin/catalog/brands/add')}>
          <FiPlus className='mr-2' />
          Add Brand
        </Button>
      </div>

      <Card className='border-none shadow-lg'>
        <div className='p-6'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='relative flex-1 max-w-sm'>
              <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Search brands...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Display</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8'>
                      <div className='flex flex-col items-center gap-2 text-gray-500'>
                        <FiSearch className='w-8 h-8' />
                        <p>No brands found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className='w-12 h-12 object-contain rounded-lg bg-gray-50'
                          />
                        ) : (
                          <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
                            <span className='text-xs text-gray-400'>No logo</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='font-medium'>{brand.name}</TableCell>
                      <TableCell>{brand.alias}</TableCell>
                      <TableCell>
                        <Badge
                          variant={brand.status === 'active' ? 'default' : 'secondary'}
                        >
                          {brand.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {brand.showOnCategory && (
                            <Badge variant='outline'>Category</Badge>
                          )}
                          {brand.showOnProduct && (
                            <Badge variant='outline'>Product</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              router.push(`/admin/catalog/brands/edit/${brand.id}`)
                            }
                          >
                            <FiEdit2 className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              setBrandToDelete(brand)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <FiTrash2 className='w-4 h-4 text-red-500' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

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