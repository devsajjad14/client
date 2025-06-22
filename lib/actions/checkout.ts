'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { addresses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

type FormState = {
  error?: string
  success?: boolean
} | null

export async function saveBillingAddress(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const street = formData.get('street')?.toString()
    const city = formData.get('city')?.toString()
    const state = formData.get('state')?.toString()
    const postalCode = formData.get('postalCode')?.toString()
    const country = formData.get('country')?.toString()
    const isDefault = formData.get('isDefault') === 'true'

    console.log('Processing billing address:', {
      street,
      city,
      state,
      postalCode,
      country,
      isDefault
    })

    if (!street || !city || !state || !postalCode || !country) {
      console.log('Missing required fields')
      return { error: 'All required fields must be filled' }
    }

    // If this is set as default, unset any other default billing address
    if (isDefault) {
      console.log('Unsetting other default billing addresses')
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, session.user.id),
            eq(addresses.type, 'billing')
          )
        )
    }

    // Check if user already has a billing address
    console.log('Checking for existing billing address')
    const existingAddress = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.userId, session.user.id),
        eq(addresses.type, 'billing')
      ),
    })

    if (existingAddress) {
      console.log('Updating existing billing address:', existingAddress.id)
      // Update existing billing address
      await db
        .update(addresses)
        .set({
          street,
          city,
          state,
          postalCode,
          country,
          isDefault,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, existingAddress.id))
    } else {
      console.log('Creating new billing address')
      // Create new billing address
      await db.insert(addresses).values({
        userId: session.user.id,
        type: 'billing',
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      })
    }

    console.log('Billing address saved successfully')
    return { success: true }
  } catch (error) {
    console.error('Save billing address error:', error)
    return { error: 'Failed to save billing address' }
  }
}

export async function saveShippingAddress(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const street = formData.get('street')?.toString()
    const city = formData.get('city')?.toString()
    const state = formData.get('state')?.toString()
    const postalCode = formData.get('postalCode')?.toString()
    const country = formData.get('country')?.toString()
    const isDefault = formData.get('isDefault') === 'on'

    if (!street || !city || !state || !postalCode || !country) {
      return { error: 'All required fields must be filled' }
    }

    // If this is set as default, unset any other default shipping address
    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, session.user.id),
            eq(addresses.type, 'shipping')
          )
        )
    }

    // Check if user already has a shipping address
    const existingAddress = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.userId, session.user.id),
        eq(addresses.type, 'shipping')
      ),
    })

    if (existingAddress) {
      // Update existing shipping address
      await db
        .update(addresses)
        .set({
          street,
          city,
          state,
          postalCode,
          country,
          isDefault,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, existingAddress.id))
    } else {
      // Create new shipping address
      await db.insert(addresses).values({
        userId: session.user.id,
        type: 'shipping',
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Save shipping address error:', error)
    return { error: 'Failed to save shipping address' }
  }
}
