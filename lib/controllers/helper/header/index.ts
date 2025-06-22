import { TaxonomyItem } from '@/types/taxonomy.types'

// Helper function to get unique DEPTs with WEB_URL (Level 1)
export const getUniqueDepts = (data: TaxonomyItem[]) => {
  const uniqueDepts = new Set<{ dept: string; web_url: string }>()
  for (const item of data) {
    if (uniqueDepts.size >= 15) break // Limit to 15 unique DEPTs
    if (item.DEPT && item.DEPT !== 'EMPTY' && item.TYP === 'EMPTY') {
      uniqueDepts.add({ dept: item.DEPT, web_url: item.WEB_URL || '#' }) // Fallback for missing WEB_URL
    }
  }
  return Array.from(uniqueDepts)
}

// Helper function to build categories map (Level 2)
export const buildCategoriesMap = (data: TaxonomyItem[]) => {
  const categories: Record<string, Array<{ typ: string; web_url: string }>> = {}
  for (const item of data) {
    if (
      item.DEPT &&
      item.DEPT !== 'EMPTY' &&
      item.TYP &&
      item.TYP !== 'EMPTY' &&
      item.SUBTYP_1 === 'EMPTY' &&
      item.WEB_URL
    ) {
      if (!categories[item.DEPT]) {
        categories[item.DEPT] = []
      }
      // Avoid duplicates
      if (!categories[item.DEPT].some((sub) => sub.typ === item.TYP)) {
        categories[item.DEPT].push({ typ: item.TYP, web_url: item.WEB_URL })
      }
    }
  }
  return categories
}
