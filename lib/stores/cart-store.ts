import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/types/product-types'

export type CartItem = {
  id: string
  productId: number
  name: string
  price: number
  quantity: number
  image: string
  color: string | null
  size: string | null
  styleCode: string
  maxQuantity: number
  variations?: Product['VARIATIONS']
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  _hasHydrated: boolean
  shippingCost: number
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  addToCart: (item: Omit<CartItem, 'id' | 'maxQuantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setHasHydrated: (state: boolean) => void
  updateShippingCost: (cost: number) => void
}

const generateCartItemId = (
  productId: number,
  color: string | null,
  size: string | null
) => {
  return `${productId}-${color || 'no-color'}-${size || 'no-size'}`
}

const getProductImage = (
  variations: Product['VARIATIONS'] = [],
  selectedColor: string | null,
  defaultImage: string
): string => {
  if (!selectedColor) return defaultImage

  // Find the variation that matches the selected color
  const colorVariation = variations.find(
    (v) =>
      (v.ATTR1_ALIAS?.trim() === selectedColor.trim() ||
        v.COLOR?.trim() === selectedColor.trim()) &&
      v.COLORIMAGE
  )

  // Return the color-specific image if found, otherwise default image
  return colorVariation?.COLORIMAGE?.replace('-m.jpg', '-l.jpg') || defaultImage
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,
      shippingCost: 5.99, // Default to standard shipping
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      updateShippingCost: (cost) => set({ shippingCost: cost }),
      addToCart: (item) => {
        const id = generateCartItemId(item.productId, item.color, item.size)
        const image = getProductImage(item.variations, item.color, item.image)

        set((state) => {
          const existingItem = state.items.find((i) => i.id === id)

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + item.quantity,
              existingItem.maxQuantity
            )
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: newQuantity, image } : i
              ),
            }
          } else {
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  id,
                  image, // This now uses the color-specific image when available
                  maxQuantity: item.quantity * 10,
                },
              ],
            }
          }
        })
        get().openCart()
      },
      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.min(quantity, item.maxQuantity),
                }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ) + get().shippingCost,
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, shippingCost: state.shippingCost }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
