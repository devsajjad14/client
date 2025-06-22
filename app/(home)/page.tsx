// app/(home)/page.tsx
'use cache'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getCarouselData } from '@/lib/actions/home/carousel'
import { getMiniBanners } from '@/lib/actions/home/mini-banners'
import ErrorBoundary from '@/components/error-boundary/error-boundary'
import { MiniBannersSkeleton } from '@/components/skeletons/mini-banners-skeleton'
import { HomeCarouselSkeleton } from '@/components/skeletons/carousel-skeleton'
import HomeCarousel from '@/components/home/home-carousel'
import { ProductCardSkeleton } from '@/components/skeletons/product-card-skeleton'
import { CompanyIntroSkeleton } from '@/components/skeletons/company-intro-skeleton'
import { BrandLogosSkeleton } from '@/components/skeletons/brand-logos-skeleton'
import { fetchBrands } from '@/lib/actions/home/brands'
import { getFeaturedProducts } from '@/lib/actions/home/featured-products'

// Dynamic imports with optimized loading states
const MiniBanners = dynamic(() => import('@/components/home/mini-banners'), {
  loading: () => <MiniBannersSkeleton />,
})

const FeaturedProductsSection = dynamic(
  () => import('@/components/product/FeaturedProductsSection'),
  {
    loading: () => <ProductSliderSkeleton />,
  }
)

const CompanyIntro = dynamic(() => import('@/components/home/company-intro'), {
  loading: () => <CompanyIntroSkeleton />,
})

const BrandLogoSlider = dynamic(() => import('@/components/home/brand-logos'), {
  loading: () => <BrandLogosSkeleton />,
})

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8) // Fetch data here

  const [carouselData, miniBanners, brandsData] = await Promise.all([
    getCarouselData(),
    getMiniBanners(),
    fetchBrands(9),
  ])

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Preload ONLY critical hero image */}

      <main className='mx-auto max-w-[1920px] px-4 sm:px-6'>
        {/* Hero Carousel */}
        <section className='relative pt-2'>
          <Suspense fallback={<HomeCarouselSkeleton />}>
            <HomeCarousel items={carouselData.data} />
          </Suspense>
        </section>

        {/* Mini Banners */}
        <ErrorBoundary fallback={<MiniBannersSkeleton />}>
          <section className='mt-2'>
            <MiniBanners banners={miniBanners} />
          </section>
        </ErrorBoundary>

        {/* Company Intro */}
        <ErrorBoundary fallback={<div>Failed to load company intro.</div>}>
          <section className='mt-8'>
            <Suspense fallback={<CompanyIntroSkeleton />}>
              <CompanyIntro />
            </Suspense>
          </section>
        </ErrorBoundary>

        {/* Featured Products */}
        <ErrorBoundary fallback={<ProductSliderSkeleton />}>
          <section className='mt-8'>
            <FeaturedProductsSection featuredProducts={featuredProducts} />
          </section>
        </ErrorBoundary>

        {/* Brand Logos */}
        <ErrorBoundary fallback={<div>Failed to load brand logos.</div>}>
          <section className='mt-8 pb-12'>
            <Suspense fallback={<BrandLogosSkeleton />}>
              {brandsData.success && brandsData.data.length > 0 ? (
                <BrandLogoSlider brandLogos={brandsData.data} />
              ) : (
                <div className='h-32 bg-gray-200 animate-pulse rounded-lg' />
              )}
            </Suspense>
          </section>
        </ErrorBoundary>
      </main>
    </div>
  )
}

function ProductSliderSkeleton() {
  return (
    <div className='w-full py-8'>
      <h2 className='text-3xl font-bold mb-6'>Featured Products</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} view='grid' />
        ))}
      </div>
    </div>
  )
}
