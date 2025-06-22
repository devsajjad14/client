import { TaxonomyItem } from '@/types/taxonomy.types'

/**
 * Get taxonomy data based on the web URL.
 * @param cat - The web URL (e.g., "decorated-treats-Crunchy-Softbite-deocot").
 * @param allTaxonomy - The list of all taxonomy items.
 * @returns An array of TaxonomyItem matching the web URL or an empty array.
 */
export const getTaxonomyByWebURL = (
  cat: string | null,
  allTaxonomy: TaxonomyItem[]
): TaxonomyItem | null => {
  // Early return if `cat` is null, undefined, or `allTaxonomy` is empty
  if (!cat || !allTaxonomy?.length) return null

  // Find all matching taxonomies based on the `cat` (web_url)
  return allTaxonomy.find((tax) => tax.WEB_URL === cat) || null
}
