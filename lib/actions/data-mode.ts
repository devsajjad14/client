'use server'

import { db } from '@/lib/db'
import { dataModeSettings } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

export async function getDataModeSettings() {
  try {
    const settings = await db.query.dataModeSettings.findFirst()
    return settings || { mode: 'local', endpoints: {} }
  } catch (error) {
    console.error('Error fetching data mode settings:', error)
    return { mode: 'local', endpoints: {} }
  }
}

export async function updateDataModeSettings(data: {
  mode: 'local' | 'remote'
  endpoints?: Record<string, string>
}) {
  try {
    const existingSettings = await db.query.dataModeSettings.findFirst()

    if (existingSettings) {
      await db
        .update(dataModeSettings)
        .set({
          mode: data.mode,
          endpoints: data.endpoints || existingSettings.endpoints,
          updatedAt: new Date(),
        })
        .where(eq(dataModeSettings.id, existingSettings.id))
    } else {
      await db.insert(dataModeSettings).values({
        mode: data.mode,
        endpoints: data.endpoints || {},
      })
    }

    revalidatePath('/admin/data-mode')
    return { success: true }
  } catch (error) {
    console.error('Error updating data mode settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
} 