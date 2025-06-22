'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/common/carousel'
import Link from 'next/link'
import Image from 'next/image'

type BrandLogo = {
  name: string
  imageUrl: string
  url: string
}

type BrandLogoSliderProps = {
  brandLogos: BrandLogo[]
}

export default function BrandLogoSlider({ brandLogos }: BrandLogoSliderProps) {
  if (!brandLogos.length) return null // Render nothing if no brands are available

  return (
    <div className='w-full bg-gradient-to-r from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
      <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight'>
        Our Trusted Brands
      </h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          skipSnaps: true,
        }}
        className='w-full relative'
      >
        <CarouselContent className='-ml-4'>
          {brandLogos.map((brandLogo) => (
            <CarouselItem
              key={brandLogo.name}
              className='pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
            >
              <Link href={brandLogo.url} className='block'>
                <div className='relative aspect-[3/2] bg-white rounded-lg shadow-sm hover:shadow-md transform transition-all duration-300 ease-in-out group overflow-hidden border border-gray-100 hover:border-blue-200'>
                  {/* Logo Image */}
                  <Image
                    src={brandLogo.imageUrl}
                    alt={brandLogo.name}
                    fill
                    className='object-contain p-4 transform group-hover:scale-105 transition-transform duration-300 ease-in-out'
                    sizes='(max-width: 640px) 60px, (max-width: 768px) 80px, 100px'
                  />
                  {/* Subtle Overlay Effect */}
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 ease-in-out rounded-lg' />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Carousel Navigation Buttons */}
        <CarouselPrevious className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-900 rounded-full p-2 hover:bg-white hover:text-blue-600 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200' />
        <CarouselNext className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-900 rounded-full p-2 hover:bg-white hover:text-blue-600 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200' />
      </Carousel>
    </div>
  )
}
