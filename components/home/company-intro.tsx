// components/home/company-intro.tsx
'use cache'
import Link from 'next/link'
import Image from 'next/image'

const CompanyIntro = async () => {
  'use cache'

  return (
    <section className='bg-gradient-to-r from-blue-50 to-gray-100 py-16'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row items-center gap-8 lg:gap-12'>
          {/* Image Section */}
          <div className='w-full lg:w-1/2 opacity-100 translate-y-0 transition-all duration-700 ease-in-out'>
            <div className='relative group overflow-hidden rounded-lg shadow-xl w-fit mx-auto'>
              <Image
                src='/images/site/company.webp'
                alt='Company Introduction'
                className='rounded-lg transition-transform duration-500 group-hover:scale-105'
                width={600}
                height={450}
                priority
                loading='eager'
                sizes='(max-width: 768px) 100vw, 50vw'
              />
              <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-500'></div>
            </div>
          </div>

          {/* Text Section */}
          <div className='w-full lg:w-1/2 text-center lg:text-left space-y-6'>
            <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors duration-300'>
              Welcome to Our World of Innovation
            </h1>
            <p className='text-lg text-gray-700 hover:text-gray-900 transition-colors duration-300'>
              At our company, we are dedicated to delivering cutting-edge
              solutions that empower businesses and individuals alike. With a
              focus on innovation, quality, and customer satisfaction, we strive
              to create products and services that make a real difference.
            </p>
            <p className='text-lg text-gray-700 hover:text-gray-900 transition-colors duration-300'>
              Our team of experts is passionate about technology and committed
              to helping you achieve your goals. Whether you are looking for
              eCommerce solutions, web design, or custom software, we have got
              you covered.
            </p>
            <p className='text-gray-900'>
              Ready to get started?{' '}
              <Link
                href='/info/about-us'
                className='text-blue-600 font-semibold hover:text-blue-800 transition-all duration-200 hover:underline'
              >
                Learn more about us
              </Link>{' '}
              and discover how we can help you succeed.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompanyIntro
