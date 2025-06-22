'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUpload, FiSave, FiX } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { getBrand, updateBrand } from '@/lib/actions/brands'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<Brand>({
    id: 0,
    name: '',
    alias: '',
    description: '',
    urlHandle: '',
    logo: '',
    showOnCategory: false,
    showOnProduct: false,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  })

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const resolvedParams = await params
        const response = await getBrand(parseInt(resolvedParams.id))
        if (response.success && response.data) {
          setFormData({
            ...response.data,
            createdAt: response.data.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: response.data.updatedAt?.toISOString() || new Date().toISOString(),
          })
          if (response.data.logo) {
            setLogoPreview(response.data.logo)
          }
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch brand',
            variant: 'destructive',
          })
          router.push('/admin/catalog/brands')
        }
      } catch (error) {
        console.error('Error fetching brand:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch brand',
          variant: 'destructive',
        })
        router.push('/admin/catalog/brands')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrand()
  }, [params, router, toast])

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      if (!formData.name) {
        toast({
          title: 'Error',
          description: 'Please enter a brand name',
          variant: 'destructive',
        })
        return
      }

      const response = await updateBrand(formData.id, {
        name: formData.name,
        alias: formData.alias,
        description: formData.description || '',
        urlHandle: formData.urlHandle,
        logo: formData.logo || '',
        showOnCategory: formData.showOnCategory,
        showOnProduct: formData.showOnProduct,
        status: formData.status,
      })

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Brand updated successfully',
        })
        router.push('/admin/catalog/brands')
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to update brand',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      alias: name,
      urlHandle: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size should be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'brands')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData((prev) => ({ ...prev, logo: data.url }))
      setLogoPreview(URL.createObjectURL(file))
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='h-10'
          >
            <FiArrowLeft className='mr-2' />
            Back
          </Button>
          <h1 className='text-2xl font-bold'>Edit Brand</h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => router.back()}
            disabled={isSaving}
            className='h-10'
          >
            <FiX className='mr-2' />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className='h-10'
          >
            <FiSave className='mr-2' />
            {isSaving ? 'Saving...' : 'Save Brand'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          <Card className='border-none shadow-lg'>
            <CardHeader className='bg-gray-50/50 border-b'>
              <CardTitle className='text-lg font-semibold'>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-sm font-medium'>Name</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder='Enter brand name'
                    className='h-10'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='alias' className='text-sm font-medium'>Alias</Label>
                  <Input
                    id='alias'
                    value={formData.alias}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, alias: e.target.value }))
                    }
                    placeholder='Enter display name'
                    className='h-10'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description' className='text-sm font-medium'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Enter brand description'
                  rows={4}
                  className='resize-none'
                />
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='urlHandle' className='text-sm font-medium'>URL Handle</Label>
                  <Input
                    id='urlHandle'
                    value={formData.urlHandle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        urlHandle: e.target.value,
                      }))
                    }
                    placeholder='Enter URL handle'
                    className='h-10'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-none shadow-lg'>
            <CardHeader className='bg-gray-50/50 border-b'>
              <CardTitle className='text-lg font-semibold'>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='showOnCategory'>Show on Category</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display this brand on category pages
                    </p>
                  </div>
                  <Switch
                    id='showOnCategory'
                    checked={formData.showOnCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        showOnCategory: e.target.checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='showOnProduct'>Show on Product</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display this brand on product pages
                    </p>
                  </div>
                  <Switch
                    id='showOnProduct'
                    checked={formData.showOnProduct}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        showOnProduct: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card className='border-none shadow-lg'>
            <CardHeader className='bg-gray-50/50 border-b'>
              <CardTitle className='text-lg font-semibold'>Status</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='status'>Active</Label>
                  <p className='text-sm text-muted-foreground'>
                    {formData.status === 'active'
                      ? 'This brand is currently active and visible to customers.'
                      : 'This brand is currently inactive and hidden from customers.'}
                  </p>
                </div>
                <Switch
                  id='status'
                  checked={formData.status === 'active'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked ? 'active' : 'inactive',
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className='border-none shadow-lg'>
            <CardHeader className='bg-gray-50/50 border-b'>
              <CardTitle className='text-lg font-semibold'>Logo</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-center w-full'>
                  <label
                    htmlFor='logo-upload'
                    className='flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200'
                  >
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                      {logoPreview ? (
                        <div className='relative group'>
                          <div className='relative w-32 h-32 rounded-lg overflow-hidden bg-white shadow-md'>
                            <img
                              src={logoPreview}
                              alt={formData.name}
                              className='w-full h-full object-contain p-2'
                            />
                          </div>
                          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.preventDefault()
                                setLogoPreview(null)
                                setFormData((prev) => ({ ...prev, logo: '' }))
                              }}
                              className='p-2 bg-white/90 text-red-500 rounded-full hover:bg-white transition-colors duration-200'
                            >
                              <FiX className='w-5 h-5' />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                            <FiUpload className='w-8 h-8 text-gray-400' />
                          </div>
                          <p className='mb-2 text-sm font-medium text-gray-600'>
                            <span className='font-semibold'>Click to upload</span> or
                            drag and drop
                          </p>
                          <p className='text-xs text-gray-500'>
                            PNG, JPG or GIF (MAX. 800x800px)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id='logo-upload'
                      type='file'
                      className='hidden'
                      accept='image/*'
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <p className='text-xs text-center text-gray-500 mt-2'>
                  Recommended size: 800x800 pixels. Maximum file size: 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 