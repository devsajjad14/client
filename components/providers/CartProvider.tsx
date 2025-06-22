'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/stores/cart-store'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const setHasHydrated = useCartStore((state) => state.setHasHydrated)

  useEffect(() => {
    const unsubHydrate = useCartStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
      setIsHydrated(true)
    })

    setIsHydrated(useCartStore.getState()._hasHydrated)

    return () => {
      unsubHydrate()
    }
  }, [setHasHydrated])

  return <>{isHydrated ? children : null}</>
}
