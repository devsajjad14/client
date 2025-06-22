'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import ProductCard from './product-card'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Product } from '@/types/product-types'

type ProductSliderProps = {
  title?: string
  products: Product[]
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
  })

  // Scroll functions optimized with `useCallback`
  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  React.useEffect(() => {
    // Optional: Auto scroll behavior or carousel adjustments can go here
  }, [emblaApi])

  return (
    <div className='w-full bg-white py-8 px-2 sm:px-4'>
      {/* Conditionally render title */}
      {title && (
        <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center sm:text-left'>
          {title}
        </h2>
      )}

      <div className='relative'>
        {/* Carousel Container */}
        <div ref={emblaRef} className='overflow-hidden'>
          <div className='flex'>
            {/* Map through products for carousel items */}
            {products.map((product) => (
              <div
                key={product.STYLE_ID}
                className='flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_20%] px-1 pb-4'
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300'
          aria-label='Previous slide'
        >
          <ArrowLeft className='h-5 w-5 text-gray-800' />
        </button>
        <button
          onClick={scrollNext}
          className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300'
          aria-label='Next slide'
        >
          <ArrowRight className='h-5 w-5 text-gray-800' />
        </button>
      </div>
    </div>
  )
}
