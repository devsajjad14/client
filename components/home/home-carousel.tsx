'use client'

import * as React from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from '@/components/common/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CarouselItem } from '@/types/carousel-types'
import Link from 'next/link'

type HomeCarouselProps = {
  items: CarouselItem[]
}

// Convert to default export
export default function HomeCarousel({ items }: HomeCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div ref={emblaRef} className='overflow-hidden relative group'>
      <div className='flex'>
        {items.map((item, index) => (
          <div key={index} className='flex-[0_0_100%] min-w-0 relative'>
            <Link href={item.url} className='block'>
              {/* Adjusted height for banners */}
              <div className='aspect-[16/7] md:aspect-[16/6] relative'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover'
                  priority={index === 0} // Prioritize first image for LCP
                  loading={index === 0 ? 'eager' : 'lazy'} // Lazy load non-visible images
                  sizes='(max-width: 768px) 100vw, 50vw' // Optimize for responsive images
                />
                {/* Overlay with modern text and button styling */}
                <div className='absolute inset-0 bg-black/20 flex items-center justify-center text-center'>
                  <div className='max-w-2xl space-y-6 px-4'>
                    <h3 className='text-xl md:text-6xl font-bold text-white drop-shadow-2xl'>
                      {item.title}
                    </h3>
                    <Button className='bg-white text-black hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-full shadow-lg transform transition-all hover:scale-105'>
                      {item.buttonCaption}
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        aria-label='Previous slide'
      >
        <ArrowLeft className='h-6 w-6' />
      </button>
      <button
        onClick={scrollNext}
        className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        aria-label='Next slide'
      >
        <ArrowRight className='h-6 w-6' />
      </button>
    </div>
  )
}
