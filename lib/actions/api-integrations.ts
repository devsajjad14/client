'use server'

import { db } from '@/lib/db'
import { apiIntegrations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ApiIntegration, NewApiIntegration } from '@/lib/db/schema'

export async function getApiIntegrations() {
  try {
    const data = await db.select().from(apiIntegrations)
    return data
  } catch (error) {
    console.error('Error loading integrations:', error)
    throw new Error('Failed to load integrations')
  }
}

export async function addApiIntegration(data: NewApiIntegration) {
  try {
    await db.insert(apiIntegrations).values(data)
    revalidatePath('/admin/apis')
    return { success: true }
  } catch (error) {
    console.error('Error adding integration:', error)
    throw new Error('Failed to add integration')
  }
}

export async function updateApiIntegration(id: number, data: Partial<NewApiIntegration>) {
  try {
    await db
      .update(apiIntegrations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(apiIntegrations.id, id))
    revalidatePath('/admin/apis')
    return { success: true }
  } catch (error) {
    console.error('Error updating integration:', error)
    throw new Error('Failed to update integration')
  }
}

export async function deleteApiIntegration(id: number) {
  try {
    await db.delete(apiIntegrations).where(eq(apiIntegrations.id, id))
    revalidatePath('/admin/apis')
    return { success: true }
  } catch (error) {
    console.error('Error deleting integration:', error)
    throw new Error('Failed to delete integration')
  }
} 