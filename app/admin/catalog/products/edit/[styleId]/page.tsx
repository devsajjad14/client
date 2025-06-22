'use client'

import { useState, useEffect, useRef } from 'react'
import { use } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiArrowLeft, FiImage, FiPlus, FiTrash2, FiGlobe, FiSave, FiX } from 'react-icons/fi'
import Image from 'next/image'
import { getAttributes } from '@/lib/actions/attributes'
import { getBrands } from '@/lib/actions/brands'
import { useRouter } from 'next/navigation'
import { getProduct, updateProduct } from '@/lib/actions/products'
import { ProductImageUpload, ProductImageUploadRef } from '@/components/ProductImageUpload'
import { VariantImageUpload } from '@/components/VariantImageUpload'
import { Label } from '@/components/ui/label'

interface ImageSet {
  large: string
  medium: string
  small: string
}

interface ProductImages {
  main: ImageSet | null
  alternates: string[]
}

interface ProductVariant {
  id: string
  title: string
  price: string
  sku: string
  inventory: string
  combinations: string[]
  barcode?: string
  available: boolean
  colorImage?: string
}

interface ProductOption {
  id: string
  name: string
  values: string[]
}

interface Attribute {
  id: string
  name: string
  display: string
  values: { value: string }[]
}

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

interface Brand {
  id: number
  name: string
  alias: string
  status: string
}

function generateCombinations(options: ProductOption[]): string[][] {
  if (options.length === 0) return []

  const values = options.map((option) => option.values)
  const combinations: string[][] = []

  function generate(current: string[], index: number) {
    if (index === values.length) {
      combinations.push([...current])
      return
    }

    for (const value of values[index]) {
      current.push(value)
      generate(current, index + 1)
      current.pop()
    }
  }

  generate([], 0)
  return combinations
}

export default function EditProductPage({ params }: { params: Promise<{ styleId: string }> }) {
  console.log('EditProductPage rendered with params:', params)
  const resolvedParams = use(params)
  console.log('Resolved params:', resolvedParams)

  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [productImages, setProductImages] = useState<ProductImages>({
    main: null,
    alternates: [],
  })
  const [options, setOptions] = useState<ProductOption[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [currentOption, setCurrentOption] = useState<ProductOption>({
    id: '',
    name: '',
    values: [''],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    comparePrice: '',
    sku: '',
    barcode: '',
    type: '',
    status: 'draft',
    visibility: 'online',
    category: '',
    brand: '',
    tags: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    seoTitle: '',
    seoDescription: '',
    seoUrl: '',
    collections: '',
    quantity: '',
    trackQuantity: false,
    hasSkuOrBarcode: false,
    continueSellingWhenOutOfStock: false,
    shopLocationQuantity: '0',
  })
  const [taxonomyItems, setTaxonomyItems] = useState<TaxonomyItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const router = useRouter()
  const imageUploadRef = useRef<ProductImageUploadRef>(null)

  // Add loading state for save button
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    console.log('useEffect triggered with styleId:', resolvedParams.styleId)
    const loadAllData = async () => {
      try {
        // First load brands and product data
        const [brandsResponse, product] = await Promise.all([
          getBrands(),
          getProduct(resolvedParams.styleId)
        ])

        if (brandsResponse.success && brandsResponse.data) {
          setBrands(brandsResponse.data)
          
          // Find brand ID after brands are loaded
          if (product) {
            const brandId = brandsResponse.data.find(brand => brand.name === product.brand)?.id.toString() || ''
            
            // Set form data with brand ID
            setFormData(prev => ({
              ...prev,
              title: product.name || '',
              description: product.longDescription || '',
              price: product.sellingPrice?.toString() || '',
              comparePrice: product.regularPrice?.toString() || '',
              sku: product.sku || '',
              barcode: product.barcode || '',
              type: product.type || '',
              status: product.onSale === 'Y' ? 'active' : 'draft',
              visibility: 'online',
              category: product.department || '',
              brand: brandId,
              tags: product.tags || '',
              weight: product.of7 || '',
              length: product.of12 || '',
              width: product.of13 || '',
              height: product.of15 || '',
              seoTitle: product.name || '',
              seoDescription: product.longDescription || '',
              seoUrl: product.urlHandle || '',
              collections: '',
              quantity: product.quantityAvailable?.toString() || '',
              trackQuantity: Boolean(product.trackInventory),
              hasSkuOrBarcode: !!(product.sku || product.barcode),
              continueSellingWhenOutOfStock: Boolean(product.continueSellingOutOfStock),
              shopLocationQuantity: '0',
            }))

            // Set images
            const allImages = []
            if (product.largePicture) {
              allImages.push(product.largePicture)
            }
            if (product.alternateImages && product.alternateImages.length > 0) {
              const altImages = product.alternateImages
                .map(img => img.AltImage)
                .filter((img): img is string => img !== null)
              allImages.push(...altImages)
            }
            setProductImages({
              main: product.largePicture ? {
                large: product.largePicture,
                medium: product.mediumPicture || product.largePicture,
                small: product.smallPicture || product.largePicture,
              } : null,
              alternates: product.alternateImages?.map(img => img.AltImage).filter((img): img is string => img !== null) || [],
            })

            // Set variants and options if they exist
            if (product.variations && product.variations.length > 0) {
              console.log('Raw variations data:', JSON.stringify(product.variations, null, 2))
              
              // Create color and size options - SWAPPED to match database structure
              const uniqueSizes = [...new Set(product.variations.map(v => {
                console.log('Size data:', { size: v.attr1Alias || v.color })
                return v.attr1Alias || v.color // This is actually size in DB
              }))]
              console.log('Unique sizes:', uniqueSizes)

              const uniqueColors = [...new Set(product.variations.map(v => {
                console.log('Color data:', { color: v.size })
                return v.size // This is actually color in DB
              }))]
              console.log('Unique colors:', uniqueColors)
              
              // Ensure color is always first, then size
              const colorOption = {
                id: 'color',
                name: 'Color',
                values: uniqueColors
              }
              
              const sizeOption = {
                id: 'size',
                name: 'Size',
                values: uniqueSizes
              }
              
              console.log('Setting options:', { colorOption, sizeOption })
              // Always put color first, then size
              setOptions([colorOption, sizeOption])

              // Create a map of existing variants for quick lookup
              const existingVariantsMap = new Map(
                product.variations.map(v => [
                  `${v.size}-${v.attr1Alias || v.color}`, // Create a unique key
                  {
                    id: v.skuId.toString(),
                    title: v.size,
                    price: v.quantity.toString(),
                    sku: v.sku || v.skuId.toString(),
                    inventory: v.quantity.toString(),
                    combinations: [v.size, v.attr1Alias || v.color],
                    barcode: v.barcode || '',
                    available: v.available || false, // Load the available state from DB
                    colorImage: v.colorImage || '',
                  }
                ])
              )

              // Generate all possible combinations
              const allCombinations = generateCombinations([colorOption, sizeOption])
              console.log('All possible combinations:', allCombinations)
              
              // Map all combinations, using existing data when available
              const mappedVariants = allCombinations.map(combination => {
                const key = `${combination[0]}-${combination[1]}`
                const existingVariant = existingVariantsMap.get(key)
                
                if (existingVariant) {
                  return existingVariant
                }
                
                // Create new variant for combinations that don't exist
                return {
                  id: Date.now().toString() + Math.random(),
                  title: combination[0],
                  price: '',
                  sku: '',
                  inventory: '',
                  combinations: combination,
                  barcode: '',
                  available: false, // Keep as false for new variants
                  colorImage: '',
                }
              })

              console.log('All mapped variants:', JSON.stringify(mappedVariants, null, 2))
              setVariants(mappedVariants)
            }
          }
        }

        // Load remaining data
        await Promise.all([
          loadAttributes(),
          fetch('/api/admin/catalog/categories').then(res => res.json()).then(data => setTaxonomyItems(data))
        ])

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }
    loadAllData()
  }, [resolvedParams.styleId])

  const loadAttributes = async () => {
    console.log('Loading attributes...')
    try {
      const data = await getAttributes()
      console.log('Attributes loaded:', data)
      setAttributes(data)
    } catch (error) {
      console.error('Error loading attributes:', error)
    }
  }

  const loadBrands = async () => {
    try {
      const response = await getBrands()
      if (response.success && response.data) {
        setBrands(response.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const loadProduct = async () => {
    console.log('Starting to load product with ID:', resolvedParams.styleId)
    try {
      const product = await getProduct(resolvedParams.styleId)
      console.log('Raw product data:', JSON.stringify(product, null, 2))
      
      if (product) {
        // Convert boolean values to ensure they are proper booleans
        const trackInventory = Boolean(product.trackInventory)
        const continueSellingOutOfStock = Boolean(product.continueSellingOutOfStock)
        
        console.log('Boolean values:', {
          trackInventory,
          continueSellingOutOfStock,
          rawTrackInventory: product.trackInventory,
          rawContinueSellingOutOfStock: product.continueSellingOutOfStock
        })

        setFormData({
          title: product.name || '',
          description: product.longDescription || '',
          price: product.sellingPrice?.toString() || '',
          comparePrice: product.regularPrice?.toString() || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          type: product.type || '',
          status: product.onSale === 'Y' ? 'active' : 'draft',
          visibility: 'online',
          category: product.department || '',
          brand: '', // We'll set this after brands are loaded
          tags: product.tags || '',
          weight: product.of7 || '',
          length: product.of12 || '',
          width: product.of13 || '',
          height: product.of15 || '',
          seoTitle: product.name || '',
          seoDescription: product.longDescription || '',
          seoUrl: product.urlHandle || '',
          collections: '',
          quantity: product.quantityAvailable?.toString() || '',
          trackQuantity: trackInventory,
          hasSkuOrBarcode: !!(product.sku || product.barcode),
          continueSellingWhenOutOfStock: continueSellingOutOfStock,
          shopLocationQuantity: '0',
        })

        // Set images
        const allImages = []
        
        // Add main image if it exists
        if (product.largePicture) {
          allImages.push(product.largePicture)
        }

        // Add alternate images if they exist
        if (product.alternateImages && product.alternateImages.length > 0) {
          const altImages = product.alternateImages
            .map(img => img.AltImage)
            .filter((img): img is string => img !== null)
          allImages.push(...altImages)
        }

        console.log('Setting images:', allImages)
        setProductImages({
          main: product.largePicture ? {
            large: product.largePicture,
            medium: product.mediumPicture || product.largePicture,
            small: product.smallPicture || product.largePicture,
          } : null,
          alternates: product.alternateImages?.map(img => img.AltImage).filter((img): img is string => img !== null) || [],
        })

        // Set variants and options
        if (product.variations && product.variations.length > 0) {
          console.log('Raw variations data:', JSON.stringify(product.variations, null, 2))
          
          // Create color and size options - SWAPPED to match database structure
          const uniqueSizes = [...new Set(product.variations.map(v => {
            console.log('Size data:', { size: v.attr1Alias || v.color })
            return v.attr1Alias || v.color // This is actually size in DB
          }))]
          console.log('Unique sizes:', uniqueSizes)

          const uniqueColors = [...new Set(product.variations.map(v => {
            console.log('Color data:', { color: v.size })
            return v.size // This is actually color in DB
          }))]
          console.log('Unique colors:', uniqueColors)
          
          // Ensure color is always first, then size
          const colorOption = {
            id: 'color',
            name: 'Color',
            values: uniqueColors
          }
          
          const sizeOption = {
            id: 'size',
            name: 'Size',
            values: uniqueSizes
          }
          
          console.log('Setting options:', { colorOption, sizeOption })
          // Always put color first, then size
          setOptions([colorOption, sizeOption])

          // Create a map of existing variants for quick lookup
          const existingVariantsMap = new Map(
            product.variations.map(v => [
              `${v.size}-${v.attr1Alias || v.color}`, // Create a unique key
              {
                id: v.skuId.toString(),
                title: v.size,
                price: v.quantity.toString(),
                sku: v.sku || v.skuId.toString(),
                inventory: v.quantity.toString(),
                combinations: [v.size, v.attr1Alias || v.color],
                barcode: v.barcode || '',
                available: v.available || false, // Load the available state from DB
                colorImage: v.colorImage || '',
              }
            ])
          )

          // Generate all possible combinations
          const allCombinations = generateCombinations([colorOption, sizeOption])
          console.log('All possible combinations:', allCombinations)
          
          // Map all combinations, using existing data when available
          const mappedVariants = allCombinations.map(combination => {
            const key = `${combination[0]}-${combination[1]}`
            const existingVariant = existingVariantsMap.get(key)
            
            if (existingVariant) {
              return existingVariant
            }
            
            // Create new variant for combinations that don't exist
            return {
              id: Date.now().toString() + Math.random(),
              title: combination[0],
              price: '',
              sku: '',
              inventory: '',
              combinations: combination,
              barcode: '',
              available: false, // Keep as false for new variants
              colorImage: '',
            }
          })

          console.log('All mapped variants:', JSON.stringify(mappedVariants, null, 2))
          setVariants(mappedVariants)
        }
      } else {
        console.log('No product data received')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Failed to load product')
    } finally {
      console.log('Finished loading product')
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      )
      setProductImages(prev => ({
        ...prev,
        alternates: [...prev.alternates, ...newImages],
      }))
    }
  }

  const startEditing = () => {
    setCurrentOption({
      id: Date.now().toString(),
      name: '',
      values: [''],
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setCurrentOption({
      id: '',
      name: '',
      values: [''],
    })
  }

  const handleOptionNameChange = (attributeId: string) => {
    const selectedAttribute = attributes.find(attr => attr.id === attributeId)
    if (selectedAttribute) {
      setCurrentOption({
        ...currentOption,
        name: selectedAttribute.name,
        values: selectedAttribute.values.map(v => v.value)
      })
    }
  }

  const saveOption = () => {
    if (currentOption.name && currentOption.values.length > 0) {
      setOptions([...options, currentOption])
      cancelEditing()
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      // Upload images first and get the result
      let finalImages = productImages
      if (imageUploadRef.current) {
        finalImages = await imageUploadRef.current.uploadAllImages()
        setProductImages(finalImages)
      }

      // Find the selected brand
      const selectedBrand = brands.find(brand => brand.id.toString() === formData.brand)

      const productData = {
        styleId: parseInt(resolvedParams.styleId),
        name: formData.title,
        style: formData.type || '',
        quantityAvailable: parseInt(formData.quantity),
        onSale: formData.status === 'active' ? 'Y' : 'N',
        isNew: 'N',
        smallPicture: finalImages.main?.small || '',
        mediumPicture: finalImages.main?.medium || '',
        largePicture: finalImages.main?.large || '',
        department: formData.category || '',
        type: formData.type || '',
        subType: '',
        brand: selectedBrand?.name || '',
        sellingPrice: parseInt(formData.price),
        regularPrice: parseInt(formData.comparePrice),
        longDescription: formData.description || '',
        of7: formData.weight || '',
        of12: formData.length || '',
        of13: formData.width || '',
        of15: formData.height || '',
        forceBuyQtyLimit: '',
        lastReceived: '',
        urlHandle: formData.seoUrl || '',
        tags: formData.tags || '',
        barcode: formData.barcode || '',
        sku: formData.sku || '',
        trackInventory: formData.trackQuantity,
        continueSellingOutOfStock: formData.continueSellingWhenOutOfStock,
        stockQuantity: parseInt(formData.quantity),
        variations: variants.map(variant => ({
          skuId: parseInt(variant.id) || Math.floor(Math.random() * 1000000),
          color: variant.combinations[0] || '',
          attr1Alias: variant.combinations[0] || '',
          hex: '#000000',
          size: variant.combinations[1] || 'One Size',
          subSize: null,
          quantity: parseInt(variant.inventory) || 0,
          colorImage: variant.colorImage || '',
          sku: variant.sku || '',
          barcode: variant.barcode || formData.barcode || '',
          available: variant.available || false
        })),
        alternateImages: finalImages.alternates.map(image => ({
          AltImage: image
        }))
      }

      await updateProduct(resolvedParams.styleId, productData)
      router.push('/admin/catalog/products')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  // Add this function to handle variant changes
  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: string) => {
    setVariants(prevVariants => {
      const newVariants = [...prevVariants]
      const variantIndex = newVariants.findIndex(v => v.id === variantId)
      
      if (variantIndex >= 0) {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          [field]: value
        }
      } else {
        newVariants.push({
          id: variantId,
          title: '',
          price: '',
          sku: '',
          inventory: '',
          combinations: [],
          barcode: '',
          available: false,
          [field]: value
        })
      }
      
      return newVariants
    })
  }

  // Add this function to handle option changes
  const handleOptionChange = (optionId: string, field: keyof ProductOption, value: string | string[]) => {
    setOptions(prevOptions => {
      const newOptions = [...prevOptions]
      const optionIndex = newOptions.findIndex(o => o.id === optionId)
      
      if (optionIndex >= 0) {
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value
        }
      } else {
        newOptions.push({
          id: optionId,
          name: '',
          values: [],
          [field]: value
        })
      }
      
      return newOptions
    })
  }

  // Add this function to handle variant image changes
  const handleVariantImageChange = (variantId: string, imageUrl: string) => {
    setVariants(prevVariants => {
      const newVariants = [...prevVariants]
      const variantIndex = newVariants.findIndex(v => v.id === variantId)
      
      if (variantIndex >= 0) {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          colorImage: imageUrl
        }
      }
      
      return newVariants
    })
  }

  const buildCategoryTree = (items: TaxonomyItem[]) => {
    const tree: { [key: string]: TaxonomyItem[] } = {}

    items.forEach((item) => {
      const key = `${item.DEPT}-${item.TYP}-${item.SUBTYP_1}-${item.SUBTYP_2}-${item.SUBTYP_3}`
      if (!tree[key]) {
        tree[key] = []
      }
      tree[key].push(item)
    })

    return tree
  }

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
            <option key={mainItem.WEB_TAXONOMY_ID} value={mainItem.WEB_TAXONOMY_ID.toString()}>
              {label} ({level})
            </option>
          )
        }
      }
    })

    return options
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.back()}
            className='hover:bg-gray-100 rounded-full'
          >
            <FiArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Edit Product</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Update product details
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            className='h-10 px-6 text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2'
            onClick={() => router.back()}
          >
            <FiX className="h-4 w-4" />
            Discard
          </Button>
          <Button
            size='sm'
            disabled={isSaving}
            className='h-10 px-6 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            onClick={handleSubmit}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-12 gap-6'>
        {/* Left Column - Main Product Details */}
        <div className='col-span-8 space-y-6'>
          {/* Product Title & Description */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <div className='space-y-4'>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Product Title *
                </label>
                <Input
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder='Enter product title'
                  required
                  className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                />
              </div>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <Textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Enter product description'
                  className='min-h-[200px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y'
                />
              </div>
            </div>
          </Card>

          {/* Media Section */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media</h3>
              <ProductImageUpload
                styleId={parseInt(resolvedParams.styleId)}
                onImagesChange={setProductImages}
                initialImages={productImages}
                ref={imageUploadRef}
              />
            </div>
          </Card>

          {/* Pricing Section */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Pricing
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-base font-medium text-gray-700 mb-2'>
                    Price *
                  </label>
                  <Input
                    name='price'
                    type='number'
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder='0.00'
                    required
                    className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                  />
                </div>
                <div>
                  <div className='flex items-center gap-1 mb-1'>
                    <label className='block text-base font-medium text-gray-700'>
                      Compare at Price
                    </label>
                    <div className='relative group'>
                      <FiGlobe className='h-4 w-4 text-gray-400 cursor-help' />
                      <div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block'>
                        <div className='bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap'>
                          To display markdown, enter a value higher than your
                          price. Often shown with a strikethrough
                          <div className='absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900'></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Input
                    name='comparePrice'
                    type='number'
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    placeholder='0.00'
                    className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Inventory Section */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 mb-6'>
                  Inventory
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Manage your products inventory and tracking settings
                </p>
              </div>
            </div>
            <div className='space-y-6'>
              {/* Track quantity section */}
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='trackQuantity'
                    name='trackQuantity'
                    checked={formData.trackQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trackQuantity: e.target.checked,
                      }))
                    }
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='trackQuantity'
                    className='text-sm font-medium text-gray-700'
                  >
                    Track quantity
                  </label>
                </div>

                {formData.trackQuantity && (
                  <div className='pl-7 space-y-4 border-l-2 border-gray-100 ml-1.5'>
                    <div className='flex items-center justify-between gap-4'>
                      <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>
                        Quantity
                      </label>
                      <div className='flex-1 max-w-[200px]'>
                        <Input
                          name='quantity'
                          type='number'
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder='0'
                          className='w-full h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                        />
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        id='continueSellingWhenOutOfStock'
                        name='continueSellingWhenOutOfStock'
                        checked={formData.continueSellingWhenOutOfStock}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            continueSellingWhenOutOfStock: e.target.checked,
                          }))
                        }
                        className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <label
                        htmlFor='continueSellingWhenOutOfStock'
                        className='text-sm font-medium text-gray-700'
                      >
                        Continue selling when out of stock
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* SKU and Barcode section */}
              <div className='space-y-4 pt-4 border-t border-gray-100'>
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='hasSkuOrBarcode'
                    name='hasSkuOrBarcode'
                    checked={formData.hasSkuOrBarcode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasSkuOrBarcode: e.target.checked,
                      }))
                    }
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='hasSkuOrBarcode'
                    className='text-sm font-medium text-gray-700'
                  >
                    This product has a SKU or barcode
                  </label>
                </div>

                {formData.hasSkuOrBarcode && (
                  <div className='pl-7 space-y-4 border-l-2 border-gray-100 ml-1.5'>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-base font-medium text-gray-700 mb-2'>
                          SKU (Stock Keeping Unit)
                        </label>
                        <Input
                          name='sku'
                          value={formData.sku}
                          onChange={handleInputChange}
                          placeholder='Enter SKU'
                          className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                        />
                      </div>
                      <div>
                        <label className='block text-base font-medium text-gray-700 mb-2'>
                          Barcode (ISBN, UPC, GTIN, etc.)
                        </label>
                        <Input
                          name='barcode'
                          value={formData.barcode}
                          onChange={handleInputChange}
                          placeholder='Enter barcode'
                          className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Shipping Section */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Shipping
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Weight
                </label>
                <Input
                  name='weight'
                  type='number'
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder='0.0'
                  className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                />
              </div>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Dimensions
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  <Input
                    name='length'
                    value={formData.length}
                    onChange={handleInputChange}
                    placeholder='Length'
                    className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                  />
                  <Input
                    name='width'
                    value={formData.width}
                    onChange={handleInputChange}
                    placeholder='Width'
                    className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                  />
                  <Input
                    name='height'
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder='Height'
                    className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Variants Section */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 mb-6'>
                  Variants
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Add options like size or color to create variants of this
                  product
                </p>
              </div>
            </div>

            {/* Option Form */}
            {isEditing && (
              <div className='mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm'>
                <div className='space-y-6'>
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      Option name *
                    </label>
                    <select
                      value={currentOption.name}
                      onChange={(e) => handleOptionNameChange(e.target.value)}
                      className='w-full h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                    >
                      <option value=''>Select an attribute</option>
                      {attributes.map((attr) => (
                        <option key={attr.id} value={attr.id}>
                          {attr.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentOption.name && (
                    <div>
                      <label className='block text-base font-medium text-gray-700 mb-2'>
                        Option values *
                      </label>
                      <div className='space-y-3'>
                        {currentOption.values.map((value, index) => (
                          <div key={index} className='flex items-center gap-3'>
                            <Input
                              value={value}
                              readOnly
                              className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg'
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='flex justify-end gap-3 pt-4 border-t'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={cancelEditing}
                      className='text-gray-600 hover:text-red-500'
                    >
                      Delete
                    </Button>
                    <Button
                      size='sm'
                      onClick={saveOption}
                      disabled={!currentOption.name}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Option Button */}
            {!isEditing && (
              <Button
                variant='outline'
                size='sm'
                onClick={startEditing}
                className='mt-4 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
              >
                <FiPlus className='mr-2 h-4 w-4' />
                Add another option
              </Button>
            )}

            {/* Variants Table */}
            {options.length > 0 && (
              <div className='mt-8'>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium text-gray-900'>Variants</h4>
                  <div className='text-sm text-gray-500'>
                    {generateCombinations(options).length} variants
                  </div>
                </div>
                <div>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        {options.map((option) => (
                          <th key={option.id} className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                            {option.name}
                          </th>
                        ))}
                        {options.some(opt => opt.name.toLowerCase() === 'color') && (
                          <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Color Image</th>
                        )}
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Price</th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>SKU</th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Inventory</th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Available</th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateCombinations(options).map((combination, index) => {
                        // Find existing variant or create new one
                        const existingVariant = variants.find((v) =>
                          v.combinations.length === combination.length &&
                          v.combinations.every((val, i) => val === combination[i])
                        )

                        const variant = existingVariant || {
                          id: Date.now().toString() + index,
                          title: combination[0],
                          price: '',
                          sku: '',
                          inventory: '',
                          combinations: combination,
                          barcode: '',
                          available: false,
                          colorImage: '',
                        }

                        return (
                          <tr key={index} className='border-b last:border-b-0 hover:bg-gray-50'>
                            {combination.map((value, valueIndex) => (
                              <td key={valueIndex} className='px-4 py-3 text-sm text-gray-900'>
                                {value}
                              </td>
                            ))}
                            {options.some(opt => opt.name.toLowerCase() === 'color') && (
                              <td className="px-4 py-3">
                                <VariantImageUpload
                                  variantId={variant.id}
                                  color={combination[0]}
                                  initialImage={variant.colorImage}
                                  onImageChange={(variantId, imageUrl) => {
                                    console.log('Variant image changed:', { variantId, imageUrl })
                                    setVariants(prevVariants => {
                                      const newVariants = [...prevVariants]
                                      const variantIndex = newVariants.findIndex(v => v.id === variantId)
                                      
                                      if (variantIndex >= 0) {
                                        newVariants[variantIndex] = {
                                          ...newVariants[variantIndex],
                                          colorImage: imageUrl
                                        }
                                      } else {
                                        newVariants.push({
                                          ...variant,
                                          colorImage: imageUrl
                                        })
                                      }
                                      
                                      console.log('Updated variants:', newVariants)
                                      return newVariants
                                    })
                                  }}
                                  styleId={parseInt(resolvedParams.styleId)}
                                />
                              </td>
                            )}
                            <td className='px-4 py-3'>
                              <Input
                                type='number'
                                value={variant.price}
                                onChange={(e) => {
                                  const newVariants = [...variants]
                                  const existingIndex = newVariants.findIndex(
                                    (v) =>
                                      v.combinations.length === combination.length &&
                                      v.combinations.every((val, i) => val === combination[i])
                                  )

                                  if (existingIndex >= 0) {
                                    newVariants[existingIndex] = {
                                      ...newVariants[existingIndex],
                                      price: e.target.value,
                                    }
                                  } else {
                                    newVariants.push({
                                      ...variant,
                                      price: e.target.value,
                                    })
                                  }
                                  setVariants(newVariants)
                                }}
                                className='w-full'
                              />
                            </td>
                            <td className='px-4 py-3'>
                              <Input
                                value={variant.sku}
                                onChange={(e) => {
                                  const newVariants = [...variants]
                                  const existingIndex = newVariants.findIndex(
                                    (v) =>
                                      v.combinations.length === combination.length &&
                                      v.combinations.every((val, i) => val === combination[i])
                                  )

                                  if (existingIndex >= 0) {
                                    newVariants[existingIndex] = {
                                      ...newVariants[existingIndex],
                                      sku: e.target.value,
                                    }
                                  } else {
                                    newVariants.push({
                                      ...variant,
                                      sku: e.target.value,
                                    })
                                  }
                                  setVariants(newVariants)
                                }}
                                className='w-full'
                              />
                            </td>
                            <td className='px-4 py-3'>
                              <Input
                                type='number'
                                value={variant.inventory}
                                onChange={(e) => {
                                  const newVariants = [...variants]
                                  const existingIndex = newVariants.findIndex(
                                    (v) =>
                                      v.combinations.length === combination.length &&
                                      v.combinations.every((val, i) => val === combination[i])
                                  )

                                  if (existingIndex >= 0) {
                                    newVariants[existingIndex] = {
                                      ...newVariants[existingIndex],
                                      inventory: e.target.value,
                                    }
                                  } else {
                                    newVariants.push({
                                      ...variant,
                                      inventory: e.target.value,
                                    })
                                  }
                                  setVariants(newVariants)
                                }}
                                className='w-full'
                              />
                            </td>
                            <td className='px-4 py-3'>
                              <input
                                type='checkbox'
                                checked={variant.available}
                                onChange={(e) => {
                                  const newVariants = [...variants]
                                  const existingIndex = newVariants.findIndex(
                                    (v) =>
                                      v.combinations.length === combination.length &&
                                      v.combinations.every((val, i) => val === combination[i])
                                  )

                                  if (e.target.checked) {
                                    if (existingIndex === -1) {
                                      newVariants.push({
                                        ...variant,
                                        available: true
                                      })
                                    } else {
                                      newVariants[existingIndex] = {
                                        ...newVariants[existingIndex],
                                        available: true
                                      }
                                    }
                                  } else {
                                    if (existingIndex >= 0) {
                                      newVariants[existingIndex] = {
                                        ...newVariants[existingIndex],
                                        available: false
                                      }
                                    }
                                  }
                                  setVariants(newVariants)
                                }}
                                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                              />
                            </td>
                            <td className='px-4 py-3'>
                              <Button
                                variant='destructive'
                                size='icon'
                                onClick={() => {
                                  const newVariants = variants.filter((v) =>
                                    !(v.combinations.length === combination.length &&
                                      v.combinations.every((val, i) => val === combination[i]))
                                  )
                                  setVariants(newVariants)
                                }}
                              >
                                <FiTrash2 className='h-4 w-4' />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Search engine listing Section */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Search engine listing
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Page title
                </label>
                <Input
                  name='seoTitle'
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder='Enter page title'
                  className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                />
              </div>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Meta description
                </label>
                <Textarea
                  name='seoDescription'
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder='Enter meta description'
                  className='min-h-[100px] h-28 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                />
              </div>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  URL and handle
                </label>
                <Input
                  name='seoUrl'
                  value={formData.seoUrl}
                  onChange={handleInputChange}
                  placeholder='Enter URL handle'
                  className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Settings & Organization */}
        <div className='col-span-4 space-y-6'>
          {/* Status Card */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>Status</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Status
                </label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2'
                >
                  <option value='draft'>Draft</option>
                  <option value='active'>Active</option>
                  <option value='archived'>Archived</option>
                </select>
              </div>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Visibility
                </label>
                <select
                  name='visibility'
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2'
                >
                  <option value='online'>Online Store</option>
                  <option value='hidden'>Hidden</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Organization Card */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Organization
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Category
                </label>
                <select
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleInputChange}
                  className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value=''>Select a category</option>
                  {renderCategoryOptions(taxonomyItems)}
                </select>
              </div>

              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Brand
                </label>
                <select
                  id='brand'
                  name='brand'
                  value={formData.brand}
                  onChange={handleInputChange}
                  className='w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value=''>Select a brand</option>
                  {brands
                    .filter(brand => brand.status === 'active')
                    .map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Tags Card */}
          <Card className='p-8 rounded-xl shadow-md bg-white mb-8'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Tags
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-base font-medium text-gray-700 mb-2'>
                  Tags
                </label>
                <Input
                  name='tags'
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder='Enter tags separated by commas'
                  className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 