'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  mainImageIndex: number
  setMainImageIndex: (index: number) => void
  productName: string
  selectedColor: string
  isNew: boolean
  onSale: boolean
}

export function ProductGallery({
  images,
  mainImageIndex,
  setMainImageIndex,
  productName,
  selectedColor,
  isNew,
  onSale,
}: ProductGalleryProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const [showMagnifier, setShowMagnifier] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleThumbnailClick = (index: number) => {
    setMainImageIndex(index)
    setIsImageLoading(true)
  }

  const handlePrevImage = () => {
    const newIndex =
      mainImageIndex === 0 ? images.length - 1 : mainImageIndex - 1
    setMainImageIndex(newIndex)
    setIsImageLoading(true)
  }

  const handleNextImage = () => {
    const newIndex =
      mainImageIndex === images.length - 1 ? 0 : mainImageIndex + 1
    setMainImageIndex(newIndex)
    setIsImageLoading(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setMagnifierPosition({ x, y })
  }

  if (!images.length) {
    return (
      <div className="lg:w-full lg:sticky lg:top-4 lg:self-start relative">
        <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 shadow-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='lg:w-full lg:sticky lg:top-4 lg:self-start relative'>
      <div className='flex gap-4'>
        {/* Thumbnail Gallery - Vertical */}
        <div className='hidden lg:flex flex-col gap-2'>
          {images.slice(0, 5).map((image, index) => (
            <button
              key={`thumbnail-${index}`}
              className={`relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border transition-all duration-300 ${
                mainImageIndex === index
                  ? 'border-2 border-black scale-105 shadow-lg'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className='object-cover'
                  sizes='80px'
                  quality={75}
                  unoptimized={true}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Main Image Container */}
        <div className='flex-1 min-w-0'>
          <div 
            ref={imageRef}
            className='relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 shadow-sm group'
            onMouseEnter={() => {
              setIsHovering(true)
              setShowMagnifier(true)
            }}
            onMouseLeave={() => {
              setIsHovering(false)
              setShowMagnifier(false)
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Loading State */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full">
              <Image
                src={images[mainImageIndex]}
                alt={`${productName} in ${selectedColor}`}
                fill
                className='object-contain p-4'
                sizes='(max-width: 1024px) 100vw, 50vw'
                priority
                quality={90}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                unoptimized={true}
              />
            </div>

            {/* Glass Magnifier */}
            {!isMobile && showMagnifier && (
              <div 
                className="pointer-events-none absolute h-[50%] w-[50%] rounded-full border-[5px] border-white/50 bg-white/20 backdrop-blur-[2px]"
                style={{
                  left: `${magnifierPosition.x}%`,
                  top: `${magnifierPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div 
                  className="absolute inset-0 overflow-hidden rounded-full"
                  style={{
                    backgroundImage: `url(${images[mainImageIndex]})`,
                    backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                    backgroundSize: '300%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
            )}

            {/* Zoom Indicator */}
            {!isMobile && !isHovering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow-lg">
                  <ZoomIn className="h-4 w-4" />
                  <span>Hover to zoom</span>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevImage}
              className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-20'
              aria-label='Previous image'
            >
              <ChevronLeft className='w-6 h-6 text-gray-800' />
            </button>
            <button
              onClick={handleNextImage}
              className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-20'
              aria-label='Next image'
            >
              <ChevronRight className='w-6 h-6 text-gray-800' />
            </button>

            {/* Floating Badges */}
            <div className='absolute top-4 left-4 flex flex-col gap-2 z-30'>
              {isNew && (
                <span className='bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md'>
                  NEW ARRIVAL
                </span>
              )}
              {onSale && (
                <span className='bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md'>
                  SALE
                </span>
              )}
            </div>
          </div>

          {/* Mobile Thumbnails */}
          <div className='flex lg:hidden gap-2 overflow-x-auto pb-2'>
            {images.slice(0, 5).map((image, index) => (
              <button
                key={`thumbnail-mobile-${index}`}
                className={`relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border transition-all duration-300 ${
                  mainImageIndex === index
                    ? 'border-2 border-black scale-105 shadow-lg'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='64px'
                    quality={75}
                    unoptimized={true}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
