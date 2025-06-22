'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { FaRegHeart, FaHeart, FaShoppingBag } from 'react-icons/fa'
import { useState } from 'react'
import type { Product } from '@/types/product-types'

interface QuantityCartWishlistProps {
  productData: {
    STYLE_ID: number
    NAME: string
    SELLING_PRICE: number
    LARGEPICTURE: string
    STYLE: string
    QUANTITY_AVAILABLE: number
    VARIATIONS?: Product['VARIATIONS']
  }
  selectedColor: string | null
  selectedSize: string | null
  quantity: number
  onQuantityChange: (quantity: number) => void
  isWishlisted: boolean
  onToggleWishlist: () => void
}

export function QuantityCartWishlist({
  productData,
  selectedColor,
  selectedSize,
  quantity,
  onQuantityChange,
  isWishlisted,
  onToggleWishlist,
}: QuantityCartWishlistProps) {
  const { addToCart, openCart } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (productData.QUANTITY_AVAILABLE <= 0) return

    setIsAdding(true)

    addToCart({
      productId: productData.STYLE_ID,
      name: productData.NAME,
      price: productData.SELLING_PRICE,
      quantity,
      image: productData.LARGEPICTURE, // This is the fallback image
      color: selectedColor,
      size: selectedSize,
      styleCode: productData.STYLE,
      variations: productData.VARIATIONS, // Pass all variations
    })

    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 500)
  }

  const hasVariations =
    productData.VARIATIONS && productData.VARIATIONS.length > 0
  const hasColorOptions =
    hasVariations && productData.VARIATIONS?.some((v) => v.COLOR)
  const hasSizeOptions =
    hasVariations && productData.VARIATIONS?.some((v) => v.SIZE)

  const isOutOfStock = productData.QUANTITY_AVAILABLE <= 0
  const requiresSelection = hasColorOptions || hasSizeOptions
  const hasSelectedAllRequired =
    (!hasColorOptions || selectedColor) && (!hasSizeOptions || selectedSize)
  const canAddToCart =
    !isOutOfStock && (!requiresSelection || hasSelectedAllRequired)

  return (
    <div className='mb-6 flex items-center gap-3'>
      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className='w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors'
            disabled={quantity <= 1}
            aria-label='Decrease quantity'
          >
            -
          </button>
          <span className='w-10 text-center'>{quantity}</span>
          <button
            onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
            className='w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors'
            disabled={quantity >= 10}
            aria-label='Increase quantity'
          >
            +
          </button>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart || isAdding}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          isOutOfStock
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : canAddToCart
            ? 'bg-black hover:bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        } ${isAdding ? 'opacity-75' : ''}`}
        aria-label={
          isOutOfStock
            ? 'Out of stock'
            : canAddToCart
            ? 'Add to cart'
            : 'Select options'
        }
      >
        {isOutOfStock ? (
          'Out of Stock'
        ) : isAdding ? (
          'Adding...'
        ) : requiresSelection && !hasSelectedAllRequired ? (
          'Select Options'
        ) : (
          <>
            <FaShoppingBag className='h-5 w-5' />
            Add to Cart
          </>
        )}
      </button>

      {/* Wishlist Button */}
      <button
        className={`p-3 border rounded-lg transition-colors ${
          isWishlisted
            ? 'border-red-500 text-red-500 bg-red-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={onToggleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? (
          <FaHeart className='h-5 w-5' />
        ) : (
          <FaRegHeart className='h-5 w-5' />
        )}
      </button>
    </div>
  )
}
