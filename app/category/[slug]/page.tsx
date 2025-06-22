// app/category/[slug]/page.tsx
import { Suspense } from 'react'
import { getTaxonomyByWebURL } from '@/lib/controllers/helper/category/taxonomy'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'
import ProductCardServerSide from '@/components/product/product-card-server-side'
import ProductsPagination from '@/components/category/products-pagination'
import SideNavWrapper from '@/components/side-nav/SideNavWrapper'
import { FiltersList } from '@/types/taxonomy.types'
import { getProducts } from '@/lib/actions/category/getproductsByUrl'
import ProductsFilter from '@/components/category/products-filter'

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await both params and searchParams
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  const taxonomyData = await fetchTaxonomyData()
  const currentTaxonomy = getTaxonomyByWebURL(resolvedParams.slug, taxonomyData)

  if (!currentTaxonomy) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl text-gray-600'>Category not found</p>
      </div>
    )
  }

  const filtersList: FiltersList[] = [
    { name: 'brand', from: '' },
    { name: 'color', from: 'VARIATIONS' },
    { name: 'size', from: 'VARIATIONS' },
    { name: 'price-range', from: '', isPrice: true },
  ]

  const { products, totalPages, productCount, isLoading } = await getProducts({
    currentTaxonomy,
    filtersList,
    params: resolvedParams,
    searchParams: resolvedSearchParams,
  })

  // Get all products for side-nav
  const { products: allProducts } = await getProducts({
    currentTaxonomy,
    filtersList,
    params: resolvedParams,
    searchParams: { ...resolvedSearchParams, perPage: '1000' },
  })

  // Determine view mode from searchParams
  const viewMode = (resolvedSearchParams?.view === 'list' || resolvedSearchParams?.view === 'grid')
    ? resolvedSearchParams.view
    : 'grid'

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex-grow'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col md:flex-row gap-8'>
            {/* Side Navigation */}
            <div className='w-full md:w-64 flex-shrink-0'>
              <Suspense fallback={<div>Loading filters...</div>}>
                <SideNavWrapper
                  products={allProducts}
                  web_url={resolvedParams.slug}
                  filtersList={filtersList}
                />
              </Suspense>
            </div>

            {/* Main Content */}
            <div className='flex-grow md:pl-8'>
              <div className='mb-10 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  <div>
                    <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight'>
                      {currentTaxonomy.DEPT}
                    </h1>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <span className='font-semibold text-gray-900'>
                        {productCount}
                      </span>
                      <span className='text-gray-500'>
                        {productCount === 1 ? 'product' : 'products'} available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Filter */}
              <div className=''>
                <ProductsFilter
                  totalPages={totalPages}
                  currentPage={
                    parseInt(resolvedSearchParams?.page as string) || 1
                  }
                />
              </div>

              {/* Products Grid */}
              <div
                className={
                  viewMode === 'list'
                    ? 'flex flex-col gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                }
              >
                {products.map((product) => (
                  <ProductCardServerSide
                    key={product.STYLE_ID}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-8'>
                  <ProductsPagination
                    totalPages={totalPages}
                    currentPage={
                      parseInt(resolvedSearchParams?.page as string) || 1
                    }
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
