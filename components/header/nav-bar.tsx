// components/header/nav-bar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'
import {
  buildCategoriesMap,
  getUniqueDepts,
} from '@/lib/controllers/helper/header'
import { TaxonomyItem } from '@/types/taxonomy.types'

export default function NavBar({ txData }: { txData: TaxonomyItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const uniqueDepts = getUniqueDepts(txData)
  const categories = buildCategoriesMap(txData)

  return (
    <nav className='bg-white border-t border-gray-100 shadow-sm   '>
      <div className='container mx-auto px-4 '>
        {/* Desktop Navigation - Unchanged functionality */}
        <div className='hidden md:flex items-center justify-between py-2'>
          {uniqueDepts.map(({ dept, web_url }) => (
            <div
              key={dept}
              className='relative group'
              onMouseEnter={() => setOpenCategory(dept)}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <Link
                href={`/category/${web_url}`}
                className='block px-3 py-2 text-sm font-small text-gray-700 hover:text-primary-600 transition-colors'
              >
                {dept}
              </Link>

              {openCategory === dept && (
                <div className='absolute left-0 mt-0 w-56 bg-white shadow-lg rounded-b-lg border border-gray-100 z-50'>
                  {categories[dept]?.map((subcategory) => (
                    <Link
                      key={`${subcategory.web_url}-${subcategory.typ}`}
                      href={`/category/${subcategory.web_url}`}
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors'
                    >
                      {subcategory.typ}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Navigation - Layout improvements only */}
        <div className='md:hidden'>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className='w-full py-3 flex items-center justify-between text-gray-800 font-medium'
            aria-expanded={mobileOpen}
          >
            <div className='flex items-center gap-2'>
              <Menu className='w-5 h-5' />
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                mobileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {mobileOpen && (
            <div className='pb-4 space-y-1'>
              {uniqueDepts.map(({ dept, web_url }) => (
                <div
                  key={dept}
                  className='border-b border-gray-100 last:border-0'
                >
                  <button
                    onClick={() =>
                      setOpenCategory(openCategory === dept ? null : dept)
                    }
                    className='w-full py-3 flex items-center justify-between text-gray-700'
                    aria-expanded={openCategory === dept}
                    aria-controls={`category-${web_url}`}
                  >
                    <span>{dept}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openCategory === dept ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openCategory === dept && (
                    <div className='pl-4 pb-2 space-y-1'>
                      {categories[dept]?.map((subcategory) => (
                        <Link
                          key={`${subcategory.web_url}-${subcategory.typ}`}
                          href={`/category/${subcategory.web_url}`}
                          className='block py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors'
                        >
                          {subcategory.typ}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
