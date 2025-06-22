// components/home/mini-banners.tsx
'use cache'
import Image from 'next/image'
import Link from 'next/link'

type MiniBanner = {
  title: string
  imgSrc: string
  url: string
  placeholder?: string
}

type MiniBannersProps = {
  banners: MiniBanner[]
}

export default async function MiniBanners({ banners }: MiniBannersProps) {
  'use cache'

  return (
    <div className='w-full bg-gray-50'>
      <div className='w-full px-1'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-1'>
          {banners.slice(0, 3).map((banner, index) => (
            <div
              key={index}
              className='relative pb-[100%] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
            >
              <Image
                src={banner.imgSrc}
                alt={banner.title}
                fill
                sizes='(max-width: 1023px) 100vw, 33vw'
                loading={index === 0 ? 'eager' : 'lazy'}
                priority={index === 0}
                className='object-cover transition-transform duration-500 group-hover:scale-105'
                quality={75}
                decoding='async'
              />
              <div className='absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/50' />
              <div className='absolute inset-0 flex flex-col items-center justify-center p-6 text-center'>
                <h3 className='text-xl font-bold text-white mb-3 drop-shadow-lg'>
                  {banner.title}
                </h3>
                <Link
                  href={banner.url}
                  className='bg-white text-gray-900 px-6 py-2 rounded-full font-medium text-sm shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-50'
                  prefetch={false}
                >
                  Discover Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
