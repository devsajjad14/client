'use client'

import { useEffect } from 'react'
import SideNav from './index'
import { Product } from '@/types/product-types'
import { FiltersList } from '@/types/taxonomy.types'

type SideNavWrapperProps = {
  products: Product[]
  web_url: string
  filtersList: FiltersList[]
}

export default function SideNavWrapper({
  products,
  web_url,
  filtersList,
}: SideNavWrapperProps) {
  useEffect(() => {
    const handleLoadingChange = (isLoading: boolean) => {
      if (isLoading) {
        document.body.style.cursor = 'wait'
      } else {
        document.body.style.cursor = 'default'
      }
    }

    // Add event listener for loading state changes
    window.addEventListener('loading-state-change', ((e: CustomEvent) => {
      handleLoadingChange(e.detail.isLoading)
    }) as EventListener)

    return () => {
      window.removeEventListener('loading-state-change', ((e: CustomEvent) => {
        handleLoadingChange(e.detail.isLoading)
      }) as EventListener)
    }
  }, [])

  return (
    <SideNav
      products={products}
      web_url={web_url}
      filtersList={filtersList}
      onLoadingChange={(isLoading) => {
        window.dispatchEvent(
          new CustomEvent('loading-state-change', {
            detail: { isLoading },
          })
        )
      }}
    />
  )
}
