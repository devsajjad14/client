// store/taxonomyStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TaxonomyItem } from '@/types/taxonomy.types'

// Define store type explicitly
interface TaxonomyStore {
  taxonomyData: TaxonomyItem[]
  setTaxonomyData: (data: TaxonomyItem[]) => void
}

const useTaxonomyStore = create<TaxonomyStore>()(
  persist(
    (set) => ({
      taxonomyData: [], // Explicitly define initial state
      setTaxonomyData: (data) => set({ taxonomyData: data }),
    }),
    {
      name: 'taxonomy-storage',
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    }
  )
)

export default useTaxonomyStore
