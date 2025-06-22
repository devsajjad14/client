import { ProductInner } from '@/components/product/product-inner'
import { getProductById } from '@/lib/actions/product/getProductById'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ slug: string[] }>
}

export default async function ProductPage({ params }: PageProps) {
  try {
    const resolvedParams = await params
    const productId = Number(resolvedParams.slug?.[1]) || 0

    // Fetch product and taxonomy data in parallel
    const [{ product }, taxonomyData] = await Promise.all([
      getProductById({ id: productId }),
      fetchTaxonomyData(),
    ])

    if (!product) {
      return notFound()
    }

    return <ProductInner product={product} taxonomyData={taxonomyData} />
  } catch (error) {
    console.error('Error loading product:', error)
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Error Loading Product
          </h1>
          <p className='text-gray-600'>
            There was an error loading the product. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
