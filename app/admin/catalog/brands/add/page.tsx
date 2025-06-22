'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUpload, FiSave, FiX } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createBrand } from '@/lib/actions/brands'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function AddBrandPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    description: '',
    urlHandle: '',
    logo: '',
    showOnCategory: false,
    showOnProduct: false,
    status: 'active',
  })

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

      const response = await createBrand(formData)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Brand created successfully',
        })
        router.push('/admin/catalog/brands')
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to add brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to add brand',
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
          <h1 className='text-2xl font-bold'>Add Brand</h1>
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
                  value={formData.description}
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
                    <Label className='text-sm font-medium'>Show on Category</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display this brand on category pages
                    </p>
                  </div>
                  <Switch
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
                    <Label className='text-sm font-medium'>Show on Product</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display this brand on product pages
                    </p>
                  </div>
                  <Switch
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
                  <Label className='text-sm font-medium'>Brand Status</Label>
                  <p className='text-sm text-muted-foreground'>
                    {formData.status === 'active' ? 'Brand is currently active' : 'Brand is currently inactive'}
                  </p>
                </div>
                <Switch
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
              <CardTitle className='text-lg font-semibold'>Brand Logo</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='border-2 border-dashed rounded-lg p-6 text-center bg-gray-50/50'>
                <input
                  type='file'
                  id='logo'
                  accept='image/*'
                  onChange={handleLogoUpload}
                  className='hidden'
                />
                <Label
                  htmlFor='logo'
                  className='cursor-pointer flex flex-col items-center justify-center'
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt='Logo preview'
                      className='w-32 h-32 object-contain mb-4 rounded-lg'
                    />
                  ) : (
                    <div className='w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg mb-4 bg-white'>
                      <FiUpload className='w-8 h-8 text-gray-400' />
                    </div>
                  )}
                  <span className='text-sm font-medium text-gray-700'>
                    Click to upload logo
                  </span>
                  <span className='text-xs text-gray-500 mt-1'>
                    PNG, JPG up to 5MB
                  </span>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 