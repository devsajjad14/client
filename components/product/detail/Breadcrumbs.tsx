'use client'
import { TaxonomyItem } from '@/types/taxonomy.types'
import { Product } from '@/types/product-types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
}

interface BreadcrumbsProps {
  productData: Product
  taxonomyData: TaxonomyItem[]
}

export default function Breadcrumbs({
  productData,
  taxonomyData,
}: BreadcrumbsProps) {
  const { DEPT, TYP, SUBTYP, NAME } = productData

  const breadcrumbItems: BreadcrumbItem[] = []

  // Always add "Home" as the first breadcrumb
  breadcrumbItems.push({ label: 'Home', href: '/' })

  // Add DEPT level if exists
  if (DEPT && DEPT !== 'EMPTY') {
    const deptTaxonomy = taxonomyData.find(
      (tax) => tax.DEPT === DEPT && tax.TYP === 'EMPTY'
    )
    if (deptTaxonomy) {
      breadcrumbItems.push({
        label: DEPT,
        href: `/category/${deptTaxonomy.WEB_URL}`,
      })
    }
  }

  // Add TYP level if exists
  if (TYP && TYP !== 'EMPTY') {
    const typTaxonomy = taxonomyData.find(
      (tax) => tax.DEPT === DEPT && tax.TYP === TYP && tax.SUBTYP_1 === 'EMPTY'
    )
    if (typTaxonomy) {
      breadcrumbItems.push({
        label: TYP,
        href: `/category/${typTaxonomy.WEB_URL}`,
      })
    }
  }

  // Add SUBTYP level (SUBTYP_1) if exists
  if (SUBTYP && SUBTYP !== 'EMPTY') {
    const subtyp1Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP &&
        tax.SUBTYP_2 === 'EMPTY'
    )
    if (subtyp1Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP,
        href: `/category/${subtyp1Taxonomy.WEB_URL}`,
      })
    }
  }

  // Add current product name as last breadcrumb
  breadcrumbItems.push({
    label: NAME || 'Product',
    href: '#',
    isCurrent: true,
  })

  return (
    <div className='mb-4 mt-5'>
      <nav className='flex' aria-label='Breadcrumb'>
        <ol className='inline-flex items-center flex-wrap gap-y-1'>
          {breadcrumbItems.map((item, index) => (
            <li key={index} className='inline-flex items-center'>
              {index > 0 && (
                <ChevronRight className='w-4 h-4 mx-1 text-gray-400' />
              )}
              {item.isCurrent ? (
                <span className='text-sm font-medium text-gray-600 line-clamp-1 max-w-[180px] md:max-w-none'>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className='text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center'
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
