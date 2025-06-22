'use client'

import ProductsFilter from './products-filter'

interface ProductsFilterWrapperProps {
  totalPages: number
  currentPage: number
}

export default function ProductsFilterWrapper({
  totalPages,
  currentPage,
}: ProductsFilterWrapperProps) {
  return <ProductsFilter totalPages={totalPages} currentPage={currentPage} />
}
