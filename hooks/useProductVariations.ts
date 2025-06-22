import { useMemo } from 'react'
import type { Product } from '@/types/product-types'

export interface ColorOption {
  id: string
  name: string
  hex: string
  image: string | null
  hasImage: boolean
  sizes: string[]
  isOutOfStock: boolean
}

export interface SizeOption {
  id: string
  name: string
  stock: number
  colors: string[]
}

export function useProductVariations(
  variations: Product['VARIATIONS'],
  selectedColor: string | null,
  selectedSize: string | null
) {
  const { colorOptions, sizeOptions } = useMemo(() => {
    const colors = new Map<string, ColorOption>()
    const sizes = new Map<string, SizeOption>()

    variations.forEach((variation) => {
      const colorName = variation.ATTR1_ALIAS || variation.COLOR
      const sizeName = variation.SIZE
      const isOutOfStock = variation.QUANTITY < 1

      // Process colors
      if (!colors.has(colorName)) {
        colors.set(colorName, {
          id: `color-${variation.COLOR.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: colorName,
          hex: variation.HEX ? `#${variation.HEX}` : '#cccccc',
          image: variation.COLORIMAGE
            ? variation.COLORIMAGE.replace('-m.jpg', '-l.jpg')
            : null,
          hasImage: !!variation.COLORIMAGE,
          sizes: [],
          isOutOfStock,
        })
      }

      // Update out of stock status if any variation is available
      const color = colors.get(colorName)
      if (color && !isOutOfStock) {
        color.isOutOfStock = false
      }

      if (color && !color.sizes.includes(sizeName)) {
        color.sizes.push(sizeName)
      }

      // Process sizes
      if (!sizes.has(sizeName)) {
        sizes.set(sizeName, {
          id: `size-${sizeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: sizeName.replace('_', '/'),
          stock: variation.QUANTITY,
          colors: [],
        })
      }
      const size = sizes.get(sizeName)
      if (size && !size.colors.includes(colorName)) {
        size.colors.push(colorName)
      }
    })

    return {
      colorOptions: Array.from(colors.values()),
      sizeOptions: Array.from(sizes.values()),
    }
  }, [variations])

  // Get filtered colors based on selected size
  const filteredColorOptions = useMemo(() => {
    if (!selectedSize) return colorOptions

    const selectedSizeData = sizeOptions.find((size) => size.name === selectedSize)
    if (!selectedSizeData) return colorOptions

    return colorOptions.filter((color) =>
      selectedSizeData.colors.includes(color.name)
    )
  }, [colorOptions, sizeOptions, selectedSize])

  // Get filtered sizes based on selected color
  const filteredSizeOptions = useMemo(() => {
    if (!selectedColor) return sizeOptions

    const selectedColorData = colorOptions.find(
      (color) => color.name === selectedColor
    )
    if (!selectedColorData) return sizeOptions

    return sizeOptions.filter((size) =>
      selectedColorData.sizes.includes(size.name)
    )
  }, [sizeOptions, colorOptions, selectedColor])

  return {
    colorOptions,
    sizeOptions,
    filteredColorOptions,
    filteredSizeOptions,
  }
} 