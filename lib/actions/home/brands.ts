// lib/actions/home/brands.ts
import { unstable_cache as cache } from 'next/cache'

type BrandLogo = {
  name: string
  imageUrl: string
  url: string
}

type BrandsResponse = {
  success: boolean
  data: BrandLogo[]
}

async function fetchBrandLogos(limit: number): Promise<BrandsResponse> {
  try {
    const brandLogos: BrandLogo[] = [
      {
        name: 'Nike',
        imageUrl: '/images/brands/nike.webp',
        url: '/search?brand=nike',
      },
      {
        name: 'Adidas',
        imageUrl: '/images/brands/adidas.webp',
        url: '/search?brand=adidas',
      },
      {
        name: 'ASICS',
        imageUrl: '/images/brands/ASICS.webp',
        url: '/search?brand=ASICS',
      },
      {
        name: 'casio',
        imageUrl: '/images/brands/casio.webp',
        url: '/search?brand=casio',
      },
      {
        name: 'Generic',
        imageUrl: '/images/brands/Generic.webp',
        url: '/search?brand=Generic',
      },
      {
        name: 'Jerzees',
        imageUrl: '/images/brands/Jerzees.webp',
        url: '/search?brand=Jerzees',
      },
      {
        name: 'seiko',
        imageUrl: '/images/brands/seiko.webp',
        url: '/search?brand=seiko',
      },
      {
        name: 'Skechers',
        imageUrl: '/images/brands/Skechers.webp',
        url: '/search?brand=Skechers',
      },
    ]

    return {
      success: true,
      data: brandLogos.slice(0, limit),
    }
  } catch (error) {
    console.error('Error fetching brand logos:', error)
    return {
      success: false,
      data: [],
    }
  }
}

export const fetchBrands = cache(fetchBrandLogos, ['brand-logos'], {
  tags: ['brands'],
  revalidate: 3600 * 24 * 7,
})
