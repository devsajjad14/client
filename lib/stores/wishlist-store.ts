import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WishlistItem = {
  productId: number
  name: string
  price: number
  image: string
  styleCode: string
}

type WishlistState = {
  items: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeFromWishlist: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      isInWishlist: (productId) =>
        get().items.some((item) => item.productId === productId),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
