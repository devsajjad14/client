// components/product/ProductCard.tsx
import Image from 'next/image'
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Product } from '@/types/product-types'
import { urlFriendly } from '@/lib/utils/index'

interface ProductCardProps {
  product: Product
}

// Optimized image loader with device-specific sizes
const alumnihallLoader = ({
  src,
  width,
  quality = 75,
}: {
  src: string
  width: number
  quality?: number
}) => {
  const url = new URL(src)
  const filename = url.pathname.split('/').pop() || ''
  // Cap quality at 80 for better performance
  const optimizedQuality = Math.min(quality, 80)
  return `https://www.alumnihall.com/prodimages/${filename}?w=${width}&q=${optimizedQuality}`
}

// Responsive image sizes configuration
const getImageSizes = () => {
  return '(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 300px'
}

const ProductCard = React.memo(({ product }: ProductCardProps) => {
  return (
    <Card
      key={product.STYLE_ID}
      className='p-0 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 m-2'
    >
      <Link
        href={`/product/id/${product.STYLE_ID}/name${urlFriendly(
          product.NAME
        )}`}
        prefetch={false}
      >
        <CardHeader className='p-0 relative group'>
          {/* Optimized Image Container */}
          <div className='relative aspect-square w-full overflow-hidden'>
            <Image
              loader={alumnihallLoader}
              src={product.MEDIUMPICTURE}
              alt={product.NAME}
              fill
              sizes={getImageSizes()}
              className='object-contain rounded-lg transition-transform duration-300 group-hover:scale-105'
              quality={75}
              loading='lazy'
              decoding='async'
              unoptimized={process.env.NODE_ENV !== 'production'}
            />
            <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300' />
          </div>
        </CardHeader>
      </Link>

      <CardContent className='flex flex-col gap-2 p-4 sm:p-6'>
        <CardTitle className='text-lg sm:text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300 line-clamp-2'>
          {product.NAME}
        </CardTitle>
        {product.SELLING_PRICE < product.REGULAR_PRICE ? (
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <p className='text-lg sm:text-xl font-bold text-red-500'>
              ${product.SELLING_PRICE}
            </p>
            <p className='text-sm sm:text-base font-medium line-through text-gray-400'>
              ${product.REGULAR_PRICE}
            </p>
          </div>
        ) : (
          <p className='text-lg sm:text-xl font-bold text-gray-800'>
            ${product.REGULAR_PRICE}
          </p>
        )}
        <CardDescription className='text-sm sm:text-base text-gray-600 line-clamp-2'>
          {product.BRAND}
        </CardDescription>
      </CardContent>

      <CardFooter className='p-4 sm:p-6 bg-gray-50 rounded-b-lg'>
        <Link
          href={`/product/id/${product.STYLE_ID}/name${urlFriendly(
            product.NAME
          )}`}
          className='w-full'
        >
          <Button className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base'>
            <span>VIEW DETAIL</span>
            <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5' />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
