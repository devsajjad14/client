'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Product } from '@/types/product-types'
import { ProductGallery } from './detail/ProductGallery'
import { ProductHeaderInfo } from './detail/ProductHeaderInfo'
import { ColorOptions } from './detail/ColorOptions'
import { SizeOptions } from './detail/SizeOptions'
import { QuantityCartWishlist } from './detail/QuantityCartWishlist'
import { ShippingInfo } from './detail/ShippingInfo'
import { ProductDescription } from './detail/ProductDescription'
import { ProductTabs } from './detail/ProductTabs'
import { ProductRecommendations } from './detail/ProductRecommendations'
import { TaxonomyItem } from '@/types/taxonomy.types'
import Breadcrumbs from './detail/Breadcrumbs'
import { useProductVariations } from '@/hooks/useProductVariations'
import { useProductImages } from '@/hooks/useProductImages'
import type { ColorOption, SizeOption } from '@/hooks/useProductVariations'
import { getProductReviewStats } from '@/lib/actions/product/productReviews'

interface ProductInnerProps {
  product: Product
  taxonomyData: TaxonomyItem[]
}

export function ProductInner({ product, taxonomyData }: ProductInnerProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  })

  const fetchReviewStats = useCallback(async () => {
    const stats = await getProductReviewStats(product.STYLE_ID.toString())
    setReviewStats(stats)
  }, [product.STYLE_ID])

  useEffect(() => {
    fetchReviewStats()
  }, [fetchReviewStats])

  const {
    colorOptions,
    sizeOptions,
    filteredColorOptions,
    filteredSizeOptions,
  } = useProductVariations(
    product?.VARIATIONS || [],
    selectedColor,
    selectedSize
  )

  const images = useProductImages(
    product || ({} as Product),
    selectedColor,
    colorOptions
  )

  const handleColorSelect = useCallback(
    (color: string | null) => {
      setSelectedColor(color)
      if (color && selectedSize) {
        const colorData = colorOptions.find(
          (c: ColorOption) => c.name === color
        )
        if (colorData && !colorData.sizes.includes(selectedSize)) {
          setSelectedSize(null)
        }
      }
    },
    [colorOptions, selectedSize]
  )

  const handleSizeSelect = useCallback(
    (size: string | null) => {
      setSelectedSize(size)
      if (size && selectedColor) {
        const sizeData = sizeOptions.find((s: SizeOption) => s.name === size)
        if (sizeData && !sizeData.colors.includes(selectedColor)) {
          setSelectedColor(null)
        }
      }
    },
    [sizeOptions, selectedColor]
  )

  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(newQuantity)
  }, [])

  const handleWishlistToggle = useCallback(() => {
    setIsWishlisted(!isWishlisted)
  }, [isWishlisted])

  const handleZipCodeChange = useCallback((newZipCode: string) => {
    setZipCode(newZipCode)
  }, [])

  if (!product || !product.VARIATIONS) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Product Data Error
          </h1>
          <p className='text-gray-600'>
            Unable to load product data. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Breadcrumbs productData={product} taxonomyData={taxonomyData} />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <ProductGallery
          images={images}
          mainImageIndex={mainImageIndex}
          setMainImageIndex={setMainImageIndex}
          productName={product.NAME}
          selectedColor={selectedColor || ''}
          isNew={product.IS_NEW === 'Y'}
          onSale={product.ON_SALE === 'Y'}
        />

        <div className='space-y-6'>
          <ProductHeaderInfo
            brand={product.BRAND}
            name={product.NAME}
            styleCode={product.STYLE}
            rating={reviewStats.averageRating}
            reviewCount={reviewStats.totalReviews}
          />

          <div className='flex items-center gap-4'>
            <span className='text-2xl font-bold'>
              ${product.SELLING_PRICE.toFixed(2)}
            </span>
            {product.REGULAR_PRICE > product.SELLING_PRICE && (
              <span className='text-lg text-gray-500 line-through'>
                ${product.REGULAR_PRICE.toFixed(2)}
              </span>
            )}
          </div>

          <ColorOptions
            options={filteredColorOptions}
            selectedColor={selectedColor}
            onSelectColor={handleColorSelect}
            displayColorsAs='color-box'
          />

          <SizeOptions
            options={filteredSizeOptions}
            selectedSize={selectedSize}
            onSelectSize={handleSizeSelect}
            displaySizesAs='size-box'
            disabled={!selectedColor && colorOptions.length > 0}
          />

          <QuantityCartWishlist
            productData={{
              STYLE_ID: product.STYLE_ID,
              NAME: product.NAME,
              SELLING_PRICE: product.SELLING_PRICE,
              LARGEPICTURE: product.LARGEPICTURE,
              STYLE: product.STYLE,
              QUANTITY_AVAILABLE: product.QUANTITY_AVAILABLE,
              VARIATIONS: product.VARIATIONS,
            }}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleWishlistToggle}
          />

          <ShippingInfo
            zipCode={zipCode}
            onZipCodeChange={handleZipCodeChange}
            onCheckZipCode={() => console.log('Checking ZIP:', zipCode)}
          />

          <ProductDescription description={product.LONG_DESCRIPTION} />
        </div>
      </div>

      <ProductTabs
        productId={product.STYLE_ID.toString()}
        onReviewSubmit={fetchReviewStats}
      />
      <ProductRecommendations dept={product.DEPT} />
    </div>
  )
}
