'use server'

import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json', 'file']),
  group: z.enum(['general', 'branding', 'colors', 'store', 'theme']),
})

interface SettingsResponse {
  success: boolean
  error?: string
  message?: string
}

export async function getSettings(group?: string) {
  try {
    const query = group
      ? db.query.settings.findMany({
          where: eq(settings.group, group),
        })
      : db.query.settings.findMany()

    const allSettings = await query
    
    const processedSettings = allSettings.reduce((acc, setting) => {
      let value: string | number | boolean = setting.value || ''
      if (setting.type === 'number') {
        value = Number(setting.value || '0')
      } else if (setting.type === 'boolean') {
        value = setting.value === 'true' || setting.value === '1'
      }
      acc[setting.key] = value
      return acc
    }, {} as Record<string, string | number | boolean>)
    
    return processedSettings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return {}
  }
}

export async function updateSetting(key: string, value: any): Promise<SettingsResponse> {
  try {
    const setting = await db.query.settings.findFirst({
      where: eq(settings.key, key),
    })

    if (!setting) {
      const group = key === 'logo' || key === 'favicon' ? 'branding' : 
                   key.includes('Color') ? 'colors' : 
                   key.startsWith('store') ? 'store' : 'general'
      
      const type = key === 'logo' || key === 'favicon' ? 'file' : 'string'
      
      await db.insert(settings).values({
        key,
        value: String(value),
        type,
        group,
      })
    } else {
      await db
        .update(settings)
        .set({
          value: String(value),
          updatedAt: new Date(),
        })
        .where(eq(settings.key, key))
    }

    revalidatePath('/admin/settings/general')
    return { 
      success: true,
      message: 'Setting updated successfully'
    }
  } catch (error) {
    console.error('Error updating setting:', error)
    return { 
      success: false, 
      error: 'Failed to update setting' 
    }
  }
}

export async function updateMultipleSettings(settingsData: Record<string, any>): Promise<SettingsResponse> {
  try {
    for (const [key, value] of Object.entries(settingsData)) {
      const setting = await db.query.settings.findFirst({
        where: eq(settings.key, key),
      })

      if (!setting) {
        const group = key === 'logo' || key === 'favicon' ? 'branding' : 
                     key.includes('Color') ? 'colors' : 
                     key.startsWith('store') ? 'store' : 
                     key.startsWith('mainBanners') || key.startsWith('miniBanners') || 
                     key.startsWith('featuredProducts') || key.startsWith('brandLogos') ||
                     key.startsWith('productsPerPage') || key.startsWith('relatedProducts') ||
                     key.startsWith('show') || key.startsWith('defaultViewMode') ||
                     key.startsWith('enableFilters') ? 'theme' : 'general'
        
        const type = key === 'logo' || key === 'favicon' ? 'file' : 
                    key.startsWith('show') || key === 'enableFilters' ? 'boolean' :
                    key === 'defaultViewMode' ? 'string' :
                    key.startsWith('mainBanners') || key.startsWith('miniBanners') || 
                    key.startsWith('featuredProducts') || key.startsWith('brandLogos') ||
                    key.startsWith('productsPerPage') || key.startsWith('relatedProducts') ? 'number' : 'string'
        
        await db.insert(settings).values({
          key,
          value: String(value),
          type,
          group,
        })
      } else {
        const group = key === 'logo' || key === 'favicon' ? 'branding' : 
                     key.includes('Color') ? 'colors' : 
                     key.startsWith('store') ? 'store' : 
                     key.startsWith('mainBanners') || key.startsWith('miniBanners') || 
                     key.startsWith('featuredProducts') || key.startsWith('brandLogos') ||
                     key.startsWith('productsPerPage') || key.startsWith('relatedProducts') ||
                     key.startsWith('show') || key.startsWith('defaultViewMode') ||
                     key.startsWith('enableFilters') ? 'theme' : 'general'

        await db
          .update(settings)
          .set({
            value: String(value),
            type: key.startsWith('show') || key === 'enableFilters' ? 'boolean' :
                  key === 'defaultViewMode' ? 'string' :
                  key.startsWith('mainBanners') || key.startsWith('miniBanners') || 
                  key.startsWith('featuredProducts') || key.startsWith('brandLogos') ||
                  key.startsWith('productsPerPage') || key.startsWith('relatedProducts') ? 'number' : 'string',
            group,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, key))
      }
    }

    revalidatePath('/admin/settings/theme')
    return { 
      success: true,
      message: 'Settings updated successfully'
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { 
      success: false, 
      error: 'Failed to update settings' 
    }
  }
} 