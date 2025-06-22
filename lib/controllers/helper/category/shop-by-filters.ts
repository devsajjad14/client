// /lib/controllers/helper/category/shop-by-filters.ts
import { Product, Variation } from '@/types/product-types'
import { FiltersList, TaxonomyItem } from '@/types/taxonomy.types'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'

export const showColorAsCheckboxes = true

export interface FilterState {
  allTaxonomy: TaxonomyItem[]
  isActionLoading: boolean
  openSections: Record<string, boolean>
  isCategoryOpen: boolean
  selectedFilters: Record<string, string[]>
}

export const initializeFilterState = (
  filtersList: FiltersList[]
): FilterState => ({
  allTaxonomy: [],
  isActionLoading: false,
  openSections: {},
  isCategoryOpen: false,
  selectedFilters: {
    ...filtersList.reduce((acc, { name }) => ({ ...acc, [name]: [] }), {}),
    'price-range': [],
  },
})

export const fetchInitialTaxonomy = async (): Promise<TaxonomyItem[]> => {
  return await fetchTaxonomyData()
}

export const initializeFiltersFromURL = (
  searchParams: URLSearchParams,
  filtersList: FiltersList[]
): Record<string, string[]> => {
  const newSelectedFilters: Record<string, string[]> = {}

  filtersList.forEach(({ name }) => {
    const paramValue = searchParams.get(name)
    newSelectedFilters[name] = paramValue ? paramValue.split(',') : []
  })

  const priceParam = searchParams.get('price-range')
  newSelectedFilters['price-range'] = priceParam ? priceParam.split(',') : []

  return newSelectedFilters
}

export const generateFilterData = (
  products: Product[],
  filterName: string,
  from: string
): string[] => {
  const getValue = (product: Product): string[] => {
    if (from === 'VARIATIONS') {
      return (
        product.VARIATIONS?.map(
          (v) => v[filterName.toUpperCase() as keyof Variation]
        ).filter((v): v is string => !!v && String(v).trim() !== '') || []
      )
    }
    const value = product[filterName.toUpperCase() as keyof Product]
    return value && String(value).trim() !== '' ? [String(value)] : []
  }

  return Array.from(new Set(products.flatMap(getValue)))
}

export const getShopByCategoryData = (
  slug: string | null,
  allTaxonomy: TaxonomyItem[]
): TaxonomyItem[] => {
  if (!slug) return []

  const currentTaxonomy = allTaxonomy.find((tax) => tax.WEB_URL === slug)
  if (!currentTaxonomy) return []

  const { DEPT, TYP, SUBTYP_1, SUBTYP_2 } = currentTaxonomy

  return allTaxonomy.filter((tax) => {
    if (TYP === 'EMPTY') {
      return (
        tax.DEPT === DEPT && tax.TYP !== 'EMPTY' && tax.SUBTYP_1 === 'EMPTY'
      )
    }
    if (SUBTYP_1 === 'EMPTY') {
      return (
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 !== 'EMPTY' &&
        tax.SUBTYP_2 === 'EMPTY'
      )
    }
    if (SUBTYP_2 === 'EMPTY') {
      return (
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 !== 'EMPTY' &&
        tax.SUBTYP_3 === 'EMPTY'
      )
    }
    return (
      tax.DEPT === DEPT &&
      tax.TYP === TYP &&
      tax.SUBTYP_1 === SUBTYP_1 &&
      tax.SUBTYP_2 === SUBTYP_2 &&
      tax.SUBTYP_3 !== 'EMPTY'
    )
  })
}

export const priceRanges = [
  'Under $50',
  '$50 - $100',
  '$100 - $200',
  'Over $200',
] as const
