'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateProducts() {
  try {
    revalidateTag('products') // Revalidate the 'products' tag

    console.log('Products revalidated successfully')
  } catch (error) {
    console.error('Error revalidating products:', error)
  }
}
