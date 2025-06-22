import { ProductCardSkeleton } from './product-card-skeleton'

export function ProductSliderSkeleton() {
  return (
    <div className='w-full bg-white py-8 px-2 sm:px-4'>
      <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center sm:text-left'>
        Featured Products
      </h2>
      <div className='flex gap-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} view='grid' />
        ))}
      </div>
    </div>
  )
}
