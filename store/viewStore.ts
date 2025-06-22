import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ViewState {
  view: 'list' | 'grid'
  setView: (view: 'list' | 'grid') => void
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      view: 'grid', // Default view
      setView: (view) => set({ view }),
    }),
    {
      name: 'view-storage', // Unique name for localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
)
