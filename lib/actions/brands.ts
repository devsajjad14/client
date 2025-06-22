'use server'

import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getBrands() {
  try {
    console.log('Fetching brands...')
    const allBrands = await db.select().from(brands)
    console.log('Brands fetched:', allBrands)
    return { success: true, data: allBrands }
  } catch (error) {
    console.error('Error fetching brands:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to fetch brands' }
  }
}

export async function getBrand(id: number) {
  try {
    const brand = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1)
    return { success: true, data: brand[0] }
  } catch (error) {
    console.error('Error fetching brand:', error)
    return { success: false, error: 'Failed to fetch brand' }
  }
}

export async function createBrand(data: {
  name: string
  alias: string
  description?: string
  urlHandle: string
  logo?: string
  showOnCategory: boolean
  showOnProduct: boolean
  status: string
}) {
  try {
    const [brand] = await db.insert(brands).values(data).returning()
    revalidatePath('/admin/catalog/brands')
    return { success: true, data: brand }
  } catch (error) {
    console.error('Error creating brand:', error)
    return { success: false, error: 'Failed to create brand' }
  }
}

export async function updateBrand(
  id: number,
  data: {
    name: string
    alias: string
    description?: string
    urlHandle: string
    logo?: string
    showOnCategory: boolean
    showOnProduct: boolean
    status: string
  }
) {
  try {
    const [brand] = await db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning()
    revalidatePath('/admin/catalog/brands')
    return { success: true, data: brand }
  } catch (error) {
    console.error('Error updating brand:', error)
    return { success: false, error: 'Failed to update brand' }
  }
}

export async function deleteBrand(id: number) {
  try {
    await db.delete(brands).where(eq(brands.id, id))
    revalidatePath('/admin/catalog/brands')
    return { success: true }
  } catch (error) {
    console.error('Error deleting brand:', error)
    return { success: false, error: 'Failed to delete brand' }
  }
} 