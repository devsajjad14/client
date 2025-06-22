'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FiSave, FiArrowLeft } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
  LONG_DESCRIPTION?: string | null
  SHORT_DESC?: string | null
  META_TAGS?: string | null
  SORT_POSITION?: string | null
  CATEGORY_STYLE?: string | null
}

interface CategoryFormData {
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  CATEGORY_NAME: string
  WEB_URL: string
  ACTIVE: number
  SHORT_DESC: string
  LONG_DESCRIPTION: string
  META_TAGS: string
  SORT_POSITION: string
}

export default function AddCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [formData, setFormData] = useState<CategoryFormData>({
    DEPT: '',
    TYP: 'EMPTY',
    SUBTYP_1: 'EMPTY',
    SUBTYP_2: 'EMPTY',
    SUBTYP_3: 'EMPTY',
    CATEGORY_NAME: '',
    WEB_URL: '',
    ACTIVE: 1,
    SHORT_DESC: '',
    LONG_DESCRIPTION: '',
    META_TAGS: '',
    SORT_POSITION: '',
  })
  const [parentCategory, setParentCategory] = useState<TaxonomyItem | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUrlValid, setIsUrlValid] = useState(true)
  const [isCheckingUrl, setIsCheckingUrl] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/catalog/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          variant: 'destructive',
        })
      }
    }
    fetchCategories()
  }, [toast])

  // Function to determine the next level in the hierarchy
  const getNextLevel = (parent: TaxonomyItem): keyof CategoryFormData => {
    // Check from top to bottom level
    if (parent.DEPT !== 'EMPTY' && parent.TYP === 'EMPTY') return 'TYP'
    if (parent.TYP !== 'EMPTY' && parent.SUBTYP_1 === 'EMPTY') return 'SUBTYP_1'
    if (parent.SUBTYP_1 !== 'EMPTY' && parent.SUBTYP_2 === 'EMPTY')
      return 'SUBTYP_2'
    if (parent.SUBTYP_2 !== 'EMPTY' && parent.SUBTYP_3 === 'EMPTY')
      return 'SUBTYP_3'
    return 'DEPT' // Default to DEPT if no parent
  }

  // Function to generate URL-friendly string
  const generateUrlSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  // Update web URL whenever category name or parent changes
  useEffect(() => {
    if (formData.CATEGORY_NAME) {
      const categorySlug = generateUrlSlug(formData.CATEGORY_NAME)
      const newWebUrl = parentCategory?.WEB_URL
        ? `${parentCategory.WEB_URL}-${categorySlug}`
        : categorySlug
      setFormData((prev) => ({ ...prev, WEB_URL: newWebUrl }))

      // Check for duplicate URL
      const checkDuplicateUrl = async () => {
        try {
          const checkResponse = await fetch(`/api/admin/catalog/categories/check-url?webUrl=${encodeURIComponent(newWebUrl)}`)
          if (!checkResponse.ok) return
          
          const { exists } = await checkResponse.json()
          if (exists) {
            setError('A category with this URL already exists. Please choose a different name.')
          } else {
            setError(null)
          }
        } catch (error) {
          console.error('Error checking URL:', error)
        }
      }

      checkDuplicateUrl()
    }
  }, [formData.CATEGORY_NAME, parentCategory?.WEB_URL])

  // Add debounced URL check
  useEffect(() => {
    const checkUrl = async () => {
      if (!formData.WEB_URL) return
      
      setIsCheckingUrl(true)
      try {
        const response = await fetch(`/api/admin/catalog/categories/check-url?webUrl=${encodeURIComponent(formData.WEB_URL)}`)
        if (!response.ok) throw new Error('Failed to check URL')
        
        const { exists } = await response.json()
        setIsUrlValid(!exists)
        if (exists) {
          setError('A category with this URL already exists. Please choose a different name.')
        } else {
          setError(null)
        }
      } catch (error) {
        console.error('Error checking URL:', error)
      } finally {
        setIsCheckingUrl(false)
      }
    }

    const timeoutId = setTimeout(checkUrl, 500) // Debounce for 500ms
    return () => clearTimeout(timeoutId)
  }, [formData.WEB_URL])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        // Use CATEGORY_NAME for the appropriate level based on parent selection
        ...(parentCategory
          ? {
              DEPT: parentCategory.DEPT,
              TYP: parentCategory.TYP,
              SUBTYP_1: parentCategory.SUBTYP_1,
              SUBTYP_2: parentCategory.SUBTYP_2,
              SUBTYP_3: parentCategory.SUBTYP_3,
            }
          : {}),
        // Set the category name at the appropriate level
        ...(parentCategory
          ? {
              [getNextLevel(parentCategory)]: formData.CATEGORY_NAME,
            }
          : {
              DEPT: formData.CATEGORY_NAME,
            }),
      }

      const response = await fetch('/api/admin/catalog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      toast({
        title: 'Success',
        description: 'Category created successfully',
      })

      // Redirect to categories list
      router.push('/admin/catalog/categories')
    } catch (error) {
      console.error('Error creating category:', error)
      setError(error instanceof Error ? error.message : 'Failed to create category. Please try again.')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create category',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add this function to build the category tree
  const buildCategoryTree = (items: TaxonomyItem[]) => {
    const tree: { [key: string]: TaxonomyItem[] } = {}

    // Group items by their hierarchy level
    items.forEach((item) => {
      const key = `${item.DEPT}-${item.TYP}-${item.SUBTYP_1}-${item.SUBTYP_2}-${item.SUBTYP_3}`
      if (!tree[key]) {
        tree[key] = []
      }
      tree[key].push(item)
    })

    return tree
  }

  // Add this function to render category options
  const renderCategoryOptions = (items: TaxonomyItem[]) => {
    const tree = buildCategoryTree(items)
    const options: React.ReactElement[] = []

    Object.entries(tree).forEach(([key, items]) => {
      const mainItem = items[0]
      const hierarchy = []
      let level = ''

      // Only process active categories
      if (mainItem.ACTIVE === 1) {
        if (mainItem.DEPT && mainItem.DEPT !== 'EMPTY') {
          hierarchy.push(mainItem.DEPT)
          level = 'Category'
        }
        if (mainItem.TYP && mainItem.TYP !== 'EMPTY') {
          hierarchy.push(mainItem.TYP)
          level = 'Type'
        }
        if (mainItem.SUBTYP_1 && mainItem.SUBTYP_1 !== 'EMPTY') {
          hierarchy.push(mainItem.SUBTYP_1)
          level = 'Subtype 1'
        }
        if (mainItem.SUBTYP_2 && mainItem.SUBTYP_2 !== 'EMPTY') {
          hierarchy.push(mainItem.SUBTYP_2)
          level = 'Subtype 2'
        }
        if (mainItem.SUBTYP_3 && mainItem.SUBTYP_3 !== 'EMPTY') {
          hierarchy.push(mainItem.SUBTYP_3)
          level = 'Subtype 3'
        }

        if (hierarchy.length > 0) {
          const label = hierarchy.join(' > ')

          options.push(
            <SelectItem
              key={mainItem.WEB_TAXONOMY_ID}
              value={mainItem.WEB_TAXONOMY_ID.toString()}
            >
              <div className='flex flex-col py-1'>
                <span className='font-medium'>{label}</span>
                <span className='text-xs text-gray-500'>
                  <span className='px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium'>
                    {level}
                  </span>
                </span>
              </div>
            </SelectItem>
          )
        }
      }
    })

    return options
  }

  // Update the category name handler
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, CATEGORY_NAME: value }))
  }

  // Update the parent selection handler
  const handleParentChange = (value: string) => {
    const selected = categories.find(
      (c) => c.WEB_TAXONOMY_ID.toString() === value
    )
    setParentCategory(selected || null)
  }

  return (
    <div className='min-h-screen bg-gray-50/50'>
      {/* Top Navigation Bar */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-[1600px] mx-auto px-6'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.back()}
                className='hover:bg-gray-100'
              >
                <FiArrowLeft className='h-5 w-5' />
              </Button>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>Add Category</h1>
                <p className='text-sm text-gray-500'>
                  Create a new product category
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                className='h-9'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || !!error}
                className='h-9 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={handleSubmit}
              >
                <FiSave className='h-4 w-4 mr-2' />
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-[1600px] mx-auto px-6 py-6'>
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center justify-between'>
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-12 gap-6'>
            {/* Main Information Card */}
            <div className='col-span-12 lg:col-span-8'>
              <Card className='shadow-sm'>
                <CardHeader className='border-b border-gray-200 bg-white'>
                  <CardTitle className='text-base font-medium'>Category Information</CardTitle>
                </CardHeader>
                <CardContent className='p-6 space-y-8'>
                  {/* Category Name */}
                  <div className='space-y-3'>
                    <Label htmlFor='name' className='text-sm font-medium'>Category Name</Label>
                    <Input
                      id='name'
                      value={formData.CATEGORY_NAME}
                      onChange={handleCategoryNameChange}
                      placeholder='Enter category name'
                      required
                      className='h-9'
                    />
                    <p className='text-sm text-gray-500'>
                      Enter a descriptive name for your category
                    </p>
                  </div>

                  {/* Parent Category Selection */}
                  <div className='space-y-3'>
                    <Label htmlFor='parent' className='text-sm font-medium'>Parent Category</Label>
                    <Select
                      value={parentCategory?.WEB_TAXONOMY_ID.toString() || 'none'}
                      onValueChange={handleParentChange}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Select parent category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>
                          New Department (Top Level)
                        </SelectItem>
                        {renderCategoryOptions(categories)}
                      </SelectContent>
                    </Select>
                    <p className='text-sm text-gray-500'>
                      Choose a parent category or create a new top-level department
                    </p>
                  </div>

                  {/* Additional Information */}
                  <div className='space-y-6'>
                    <div className='space-y-3'>
                      <h2 className='text-sm font-medium text-gray-900'>Additional Information</h2>
                      <p className='text-sm text-gray-500'>
                        Provide additional details about your category
                      </p>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      <div className='space-y-3'>
                        <Label htmlFor='SHORT_DESC' className='text-sm font-medium'>Short Description</Label>
                        <Textarea
                          id='SHORT_DESC'
                          name='SHORT_DESC'
                          value={formData.SHORT_DESC}
                          onChange={handleInputChange}
                          placeholder='Enter short description'
                          className='min-h-[150px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y'
                        />
                        <p className='text-sm text-gray-500'>
                          A brief description for quick reference
                        </p>
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='LONG_DESCRIPTION' className='text-sm font-medium'>Long Description</Label>
                        <Textarea
                          id='LONG_DESCRIPTION'
                          name='LONG_DESCRIPTION'
                          value={formData.LONG_DESCRIPTION}
                          onChange={handleInputChange}
                          placeholder='Enter long description'
                          className='min-h-[150px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y'
                        />
                        <p className='text-sm text-gray-500'>
                          Detailed description of the category
                        </p>
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='META_TAGS' className='text-sm font-medium'>Meta Tags</Label>
                        <Input
                          id='META_TAGS'
                          name='META_TAGS'
                          value={formData.META_TAGS}
                          onChange={handleInputChange}
                          placeholder='Enter meta tags'
                          className='h-9'
                        />
                        <p className='text-sm text-gray-500'>
                          SEO keywords separated by commas
                        </p>
                      </div>
                      <div className='space-y-3'>
                        <Label htmlFor='SORT_POSITION' className='text-sm font-medium'>Sort Position</Label>
                        <Input
                          id='SORT_POSITION'
                          name='SORT_POSITION'
                          value={formData.SORT_POSITION}
                          onChange={handleInputChange}
                          placeholder='Enter sort position'
                          className='h-9'
                        />
                        <p className='text-sm text-gray-500'>
                          Position in the category list (lower numbers appear first)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='col-span-12 lg:col-span-4'>
              <div className='space-y-6'>
                {/* Settings Card */}
                <Card className='shadow-sm'>
                  <CardHeader className='border-b border-gray-200 bg-white'>
                    <CardTitle className='text-base font-medium'>Settings</CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    {/* Status */}
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-0.5'>
                          <Label className='text-sm font-medium'>Status</Label>
                          <p className='text-sm text-gray-500'>
                            Set the category as active or inactive
                          </p>
                        </div>
                        <Switch
                          checked={formData.ACTIVE === 1}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev) => ({
                              ...prev,
                              ACTIVE: e.target.checked ? 1 : 0,
                            }))
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Card */}
                <Card className='shadow-sm'>
                  <CardHeader className='border-b border-gray-200 bg-white'>
                    <CardTitle className='text-base font-medium'>Preview</CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-900'>Web URL</p>
                        <p className='text-sm text-gray-500 break-all'>
                          {formData.WEB_URL || 'Will be generated automatically'}
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-900'>Category Path</p>
                        <p className='text-sm text-gray-500'>
                          {parentCategory 
                            ? [
                                parentCategory.DEPT,
                                parentCategory.TYP,
                                parentCategory.SUBTYP_1,
                                parentCategory.SUBTYP_2,
                                parentCategory.SUBTYP_3,
                                formData.CATEGORY_NAME
                              ]
                              .filter(value => value && value !== 'EMPTY')
                              .join(' > ')
                            : formData.CATEGORY_NAME}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
