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

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
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
  const [parentCategory, setParentCategory] = useState<TaxonomyItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories for parent selection
        const categoriesResponse = await fetch('/api/admin/catalog/categories')
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Fetch current category data
        const categoryResponse = await fetch(`/api/admin/catalog/categories/${resolvedParams.id}`)
        if (!categoryResponse.ok) throw new Error('Failed to fetch category')
        const categoryData = await categoryResponse.json()

        // Find parent category based on hierarchy
        let parentCategory = null
        if (categoryData.SUBTYP_3 !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === categoryData.TYP &&
              cat.SUBTYP_1 === categoryData.SUBTYP_1 &&
              cat.SUBTYP_2 === categoryData.SUBTYP_2 &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        } else if (categoryData.SUBTYP_2 !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === categoryData.TYP &&
              cat.SUBTYP_1 === categoryData.SUBTYP_1 &&
              cat.SUBTYP_2 === 'EMPTY' &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        } else if (categoryData.SUBTYP_1 !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === categoryData.TYP &&
              cat.SUBTYP_1 === 'EMPTY' &&
              cat.SUBTYP_2 === 'EMPTY' &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        } else if (categoryData.TYP !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === 'EMPTY' &&
              cat.SUBTYP_1 === 'EMPTY' &&
              cat.SUBTYP_2 === 'EMPTY' &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        }

        // Set parent category if found
        if (parentCategory) {
          setParentCategory(parentCategory)
        }

        // Set form data
        setFormData({
          DEPT: categoryData.DEPT,
          TYP: categoryData.TYP,
          SUBTYP_1: categoryData.SUBTYP_1,
          SUBTYP_2: categoryData.SUBTYP_2,
          SUBTYP_3: categoryData.SUBTYP_3,
          CATEGORY_NAME: getCategoryName(categoryData),
          WEB_URL: categoryData.WEB_URL,
          ACTIVE: categoryData.ACTIVE,
          SHORT_DESC: categoryData.SHORT_DESC || '',
          LONG_DESCRIPTION: categoryData.LONG_DESCRIPTION || '',
          META_TAGS: categoryData.META_TAGS || '',
          SORT_POSITION: categoryData.SORT_POSITION || '',
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load category data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, toast])

  // Helper function to get category name based on hierarchy
  const getCategoryName = (category: TaxonomyItem): string => {
    if (category.SUBTYP_3 !== 'EMPTY') return category.SUBTYP_3
    if (category.SUBTYP_2 !== 'EMPTY') return category.SUBTYP_2
    if (category.SUBTYP_1 !== 'EMPTY') return category.SUBTYP_1
    if (category.TYP !== 'EMPTY') return category.TYP
    return category.DEPT
  }

  // Function to determine the next level in the hierarchy
  const getNextLevel = (parent: TaxonomyItem): keyof CategoryFormData => {
    if (parent.DEPT !== 'EMPTY' && parent.TYP === 'EMPTY') return 'TYP'
    if (parent.TYP !== 'EMPTY' && parent.SUBTYP_1 === 'EMPTY') return 'SUBTYP_1'
    if (parent.SUBTYP_1 !== 'EMPTY' && parent.SUBTYP_2 === 'EMPTY') return 'SUBTYP_2'
    if (parent.SUBTYP_2 !== 'EMPTY' && parent.SUBTYP_3 === 'EMPTY') return 'SUBTYP_3'
    return 'DEPT'
  }

  // Function to generate URL-friendly string
  const generateUrlSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Update web URL whenever category name or parent changes
  useEffect(() => {
    if (formData.CATEGORY_NAME) {
      const categorySlug = generateUrlSlug(formData.CATEGORY_NAME)
      const newWebUrl = parentCategory?.WEB_URL
        ? `${parentCategory.WEB_URL}-${categorySlug}`
        : categorySlug
      setFormData((prev) => ({ ...prev, WEB_URL: newWebUrl }))
    }
  }, [formData.CATEGORY_NAME, parentCategory?.WEB_URL])

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
        // If there's a parent category, use its hierarchy and add the new category name
        ...(parentCategory
          ? {
              DEPT: parentCategory.DEPT,
              TYP: parentCategory.TYP,
              SUBTYP_1: parentCategory.SUBTYP_1,
              SUBTYP_2: parentCategory.SUBTYP_2,
              SUBTYP_3: parentCategory.SUBTYP_3,
              [getNextLevel(parentCategory)]: formData.CATEGORY_NAME,
            }
          : {
              // If no parent, it's a top-level category
              DEPT: formData.CATEGORY_NAME,
              TYP: 'EMPTY',
              SUBTYP_1: 'EMPTY',
              SUBTYP_2: 'EMPTY',
              SUBTYP_3: 'EMPTY',
            }),
        // Remove CATEGORY_NAME as it's not a database field
        CATEGORY_NAME: undefined,
      }

      const response = await fetch(`/api/admin/catalog/categories/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })

      router.push('/admin/catalog/categories')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update category. Please try again.')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
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

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, CATEGORY_NAME: value }))
  }

  const handleParentChange = (value: string) => {
    if (value === 'none') {
      setParentCategory(null)
      return
    }
    const selected = categories.find(
      (c) => c.WEB_TAXONOMY_ID.toString() === value
    )
    setParentCategory(selected || null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading category...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <FiArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Category</h1>
                <p className="text-sm text-gray-500">
                  Update category information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
              >
                <FiSave className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-6">
            {/* Main Information Card */}
            <div className="col-span-12 lg:col-span-8">
              <Card className="shadow-sm">
                <CardHeader className="border-b border-gray-200 bg-white">
                  <CardTitle className="text-base font-medium">Category Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {/* Category Name */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.CATEGORY_NAME}
                      onChange={handleCategoryNameChange}
                      placeholder="Enter category name"
                      required
                      className="h-9"
                    />
                    <p className="text-sm text-gray-500">
                      Enter a descriptive name for your category
                    </p>
                  </div>

                  {/* Parent Category Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="parent" className="text-sm font-medium">Parent Category</Label>
                    <Select
                      value={parentCategory?.WEB_TAXONOMY_ID.toString() || 'none'}
                      onValueChange={handleParentChange}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          New Department (Top Level)
                        </SelectItem>
                        {renderCategoryOptions(categories)}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Choose a parent category or create a new top-level department
                    </p>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h2 className="text-sm font-medium text-gray-900">Additional Information</h2>
                      <p className="text-sm text-gray-500">
                        Provide additional details about your category
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="SHORT_DESC" className="text-sm font-medium">Short Description</Label>
                        <Textarea
                          id="SHORT_DESC"
                          name="SHORT_DESC"
                          value={formData.SHORT_DESC}
                          onChange={handleInputChange}
                          placeholder="Enter short description"
                          className="min-h-[150px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
                        />
                        <p className="text-sm text-gray-500">
                          A brief description for quick reference
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="LONG_DESCRIPTION" className="text-sm font-medium">Long Description</Label>
                        <Textarea
                          id="LONG_DESCRIPTION"
                          name="LONG_DESCRIPTION"
                          value={formData.LONG_DESCRIPTION}
                          onChange={handleInputChange}
                          placeholder="Enter long description"
                          className="min-h-[150px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
                        />
                        <p className="text-sm text-gray-500">
                          Detailed description of the category
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="META_TAGS" className="text-sm font-medium">Meta Tags</Label>
                        <Input
                          id="META_TAGS"
                          name="META_TAGS"
                          value={formData.META_TAGS}
                          onChange={handleInputChange}
                          placeholder="Enter meta tags"
                          className="h-9"
                        />
                        <p className="text-sm text-gray-500">
                          SEO keywords separated by commas
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="SORT_POSITION" className="text-sm font-medium">Sort Position</Label>
                        <Input
                          id="SORT_POSITION"
                          name="SORT_POSITION"
                          value={formData.SORT_POSITION}
                          onChange={handleInputChange}
                          placeholder="Enter sort position"
                          className="h-9"
                        />
                        <p className="text-sm text-gray-500">
                          Position in the category list (lower numbers appear first)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="space-y-6">
                {/* Settings Card */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b border-gray-200 bg-white">
                    <CardTitle className="text-base font-medium">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Status */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Status</Label>
                          <p className="text-sm text-gray-500">
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
                <Card className="shadow-sm">
                  <CardHeader className="border-b border-gray-200 bg-white">
                    <CardTitle className="text-base font-medium">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Web URL</p>
                        <p className="text-sm text-gray-500 break-all">
                          {formData.WEB_URL || 'Will be generated automatically'}
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