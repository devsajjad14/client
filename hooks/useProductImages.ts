import { useMemo } from 'react'
import type { Product } from '@/types/product-types'
import type { ColorOption } from './useProductVariations'

// Helper function to optimize image URL
const getOptimizedImageUrl = (url: string, width: number, quality = 80) => {
  if (!url) return ''
  
  try {
    // Handle data URLs
    if (url.startsWith('data:')) {
      return url
    }

    // Handle relative URLs
    if (url.startsWith('/')) {
      return url
    }
    
    // Handle full URLs
    const urlObj = new URL(url)
    return url
  } catch {
    return url
  }
}

export function useProductImages(
  product: Product,
  selectedColor: string | null,
  colorOptions: ColorOption[]
) {
  return useMemo(() => {
    const images: string[] = []

    // Add main color image if available
    const selectedColorData = colorOptions.find(
      (color) => color.name === selectedColor
    )
    if (selectedColorData?.image) {
      const colorImage = getOptimizedImageUrl(selectedColorData.image, 1200)
      if (colorImage) images.push(colorImage)
    }

    // Add default product image
    if (product.LARGEPICTURE) {
      const mainImage = getOptimizedImageUrl(product.LARGEPICTURE, 1200)
      if (mainImage) images.push(mainImage)
    }

    // Add alternate images
    if (product.ALTERNATE_IMAGES?.length) {
      product.ALTERNATE_IMAGES.forEach((img) => {
        if (img.LARGEALTPICTURE) {
          const altImage = getOptimizedImageUrl(img.LARGEALTPICTURE, 1200)
          if (altImage) images.push(altImage)
        }
      })
    }

    // Ensure we always have at least one image
    if (images.length === 0 && product.MEDIUMPICTURE) {
      const fallbackImage = getOptimizedImageUrl(product.MEDIUMPICTURE, 1200)
      if (fallbackImage) images.push(fallbackImage)
    }

    // Remove any duplicate URLs
    return [...new Set(images)]
  }, [product, selectedColor, colorOptions])
} 