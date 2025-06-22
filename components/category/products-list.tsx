// components/category/ProductsList.tsx

import { Product } from '../../types/product-types'
import ProductCardServerSide from '../product/product-card-server-side'

interface ProductsListProps {
  products: Product[] // Pass products as props
}

export default function ProductsList({ products }: ProductsListProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {products?.map((product) => (
        <ProductCardServerSide key={product.STYLE_ID} product={product} />
      ))}
    </div>
  )
}
