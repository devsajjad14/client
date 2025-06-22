import ProductsFilter from './products-filter'
import ProductsList from './products-list'
import { Product } from '../../types/product-types'

interface ProductsViewProps {
  products: Product[]
  totalPages: number
  currentPage: number
}

export default function ProductsView({
  products,
  totalPages,
  currentPage,
}: ProductsViewProps) {
  return (
    <div className='w-full'>
      <ProductsFilter totalPages={totalPages} currentPage={currentPage} />
      <ProductsList products={products} />
    </div>
  )
}
