/**
 * Utility functions for managing product images in Vercel Blob storage
 */

export interface ImagePaths {
  large?: string
  medium?: string
  small?: string
  main?: string
}

/**
 * Generate image paths for product images
 * @param styleId - Product style ID
 * @param isAlternate - Whether this is an alternate image
 * @param alternateIndex - Index for alternate images (1, 2, 3, etc.)
 * @returns Object with image paths
 */
export function generateImagePaths(styleId: string, isAlternate: boolean = false, alternateIndex?: string): ImagePaths {
  const baseDir = 'products'
  
  if (isAlternate && alternateIndex) {
    // Alternate images: products/style_id_alt_1.jpg, products/style_id_alt_2.jpg, etc.
    return {
      main: `${baseDir}/${styleId}_alt_${alternateIndex}.jpg`
    }
  } else {
    // Main images: products/style_id_l.jpg, products/style_id_m.jpg, products/style_id_s.jpg
    return {
      large: `${baseDir}/${styleId}_l.jpg`,
      medium: `${baseDir}/${styleId}_m.jpg`,
      small: `${baseDir}/${styleId}_s.jpg`
    }
  }
}

/**
 * Extract style ID from image URL
 * @param imageUrl - Full image URL from Vercel Blob
 * @returns Style ID or null if not found
 */
export function extractStyleIdFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    if (filename.includes('_alt_')) {
      // Alternate image: products/12345_alt_1.jpg -> 12345
      return filename.split('_alt_')[0]
    } else if (filename.includes('_l.') || filename.includes('_m.') || filename.includes('_s.')) {
      // Main image: products/12345_l.jpg -> 12345
      return filename.split('_')[0]
    }
    
    return null
  } catch (error) {
    console.error('Error extracting style ID from URL:', error)
    return null
  }
}

/**
 * Check if image URL is from products directory
 * @param imageUrl - Full image URL
 * @returns Boolean indicating if image is from products directory
 */
export function isProductImage(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl)
    return url.pathname.includes('/products/')
  } catch (error) {
    return false
  }
}

/**
 * Get optimized image URL for display
 * @param imageUrl - Original image URL
 * @param size - Desired size ('small', 'medium', 'large')
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!isProductImage(imageUrl)) {
    return imageUrl
  }

  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    // If it's already the right size, return as is
    if (filename.includes(`_${size.charAt(0)}.`)) {
      return imageUrl
    }
    
    // For alternate images, return as is (no size variants)
    if (filename.includes('_alt_')) {
      return imageUrl
    }
    
    // For main images, get the appropriate size
    const styleId = filename.split('_')[0]
    const extension = filename.split('.').pop()
    const sizeSuffix = size === 'large' ? 'l' : size === 'medium' ? 'm' : 's'
    
    const newFilename = `${styleId}_${sizeSuffix}.${extension}`
    pathParts[pathParts.length - 1] = newFilename
    
    return `${url.origin}${pathParts.join('/')}`
  } catch (error) {
    console.error('Error optimizing image URL:', error)
    return imageUrl
  }
} 