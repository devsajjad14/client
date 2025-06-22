'use client'
import { TaxonomyItem } from '@/types/taxonomy.types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  taxonomyData: TaxonomyItem[]
  web_url: string
  productCount: number
}

export default function Breadcrumbs({
  taxonomyData,
  web_url,
  productCount,
}: BreadcrumbsProps) {
  const currentTaxonomy = taxonomyData.find((tax) => tax.WEB_URL === web_url)
  if (!currentTaxonomy) return null

  const { DEPT, TYP, SUBTYP_1, SUBTYP_2, SUBTYP_3 } = currentTaxonomy

  const breadcrumbItems = []

  // Always add "Home" as the first breadcrumb
  breadcrumbItems.push({ label: 'Home', href: '/' })

  // Add DEPT level
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

  // Add TYP level
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

  // Add SUBTYP_1 level
  if (SUBTYP_1 && SUBTYP_1 !== 'EMPTY') {
    const subtyp1Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 === 'EMPTY'
    )
    if (subtyp1Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP_1,
        href: `/category/${subtyp1Taxonomy.WEB_URL}`,
      })
    }
  }

  // Add SUBTYP_2 level
  if (SUBTYP_2 && SUBTYP_2 !== 'EMPTY') {
    const subtyp2Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 === SUBTYP_2 &&
        tax.SUBTYP_3 === 'EMPTY'
    )
    if (subtyp2Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP_2,
        href: `/category/${subtyp2Taxonomy.WEB_URL}`,
      })
    }
  }

  // Add SUBTYP_3 level
  if (SUBTYP_3 && SUBTYP_3 !== 'EMPTY') {
    const subtyp3Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 === SUBTYP_2 &&
        tax.SUBTYP_3 === SUBTYP_3
    )
    if (subtyp3Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP_3,
        href: `/category/${subtyp3Taxonomy.WEB_URL}`,
      })
    }
  }

  const currentPage = breadcrumbItems[breadcrumbItems.length - 1]

  return (
    <div className='space-y-1 mb-4 mt-5'>
      <nav className='flex' aria-label='Breadcrumb'>
        <ol className='inline-flex items-center space-x-1 md:space-x-2'>
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className='inline-flex items-center'>
              {index > 0 && (
                <ChevronRight className='w-4 h-4 mx-1 text-gray-400' />
              )}
              {index === breadcrumbItems.length - 1 ? (
                <span className='text-sm font-medium text-gray-600'>
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

      <div className='flex items-baseline gap-2'>
        <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
          {currentPage?.label}
        </h1>
        <span className='text-sm text-gray-500'>({productCount})</span>
      </div>
    </div>
  )
}
