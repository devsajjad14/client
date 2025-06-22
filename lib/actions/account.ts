// lib/actions/account.ts
'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { userProfiles, addresses } from '@/lib/db/schema'
import { Address } from '@/types/address'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  return await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, session.user.id),
  })
}

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const firstName = formData.get('firstName')?.toString()
    const lastName = formData.get('lastName')?.toString()
    const phone = formData.get('phone')?.toString()

    if (!firstName || !lastName) {
      return { error: 'First and last name are required' }
    }

    await db
      .insert(userProfiles)
      .values({
        id: session.user.id,
        firstName,
        lastName,
        phone: phone || null,
      })
      .onConflictDoUpdate({
        target: userProfiles.id,
        set: {
          firstName,
          lastName,
          phone: phone || null,
        },
      })

    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }
}
export async function getAddresses(): Promise<Address[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const result = await db.query.addresses.findMany({
    where: eq(addresses.userId, session.user.id),
    orderBy: (addresses, { desc }) => [desc(addresses.isDefault)],
  })

  // Transform the result to match the Address type
  return result.map((addr) => ({
    ...addr,
    type: addr.type as 'billing' | 'shipping',
    isDefault: addr.isDefault ?? false,
    createdAt: addr.createdAt ?? null,
    updatedAt: addr.updatedAt ?? null,
    street2: addr.street2 ?? null,
  }))
}

type FormState = {
  error?: string
  success?: boolean
} | null

export async function createAddress(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const type = formData.get('type')?.toString()
    const street = formData.get('street')?.toString()
    const street2 = formData.get('street2')?.toString()
    const city = formData.get('city')?.toString()
    const state = formData.get('state')?.toString()
    const postalCode = formData.get('postalCode')?.toString()
    const country = formData.get('country')?.toString()
    const isDefault = formData.get('isDefault') === 'on'

    if (!type || !street || !city || !state || !postalCode || !country) {
      return { error: 'All required fields must be filled' }
    }

    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, session.user.id))
    }

    await db.insert(addresses).values({
      userId: session.user.id,
      type: type as 'billing' | 'shipping',
      street,
      street2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    })

    return { success: true }
  } catch (error) {
    console.error('Create address error:', error)
    return { error: 'Failed to create address' }
  }
}
export async function deleteAddress(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await db
    .delete(addresses)
    .where(eq(addresses.id, id) && eq(addresses.userId, session.user.id))

  revalidatePath('/account/addresses')
}

// Add to lib/actions/account.ts
export async function updateAddress(data: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const id = data.get('id')?.toString()
  const type = data.get('type')?.toString()
  const isDefault = data.get('isDefault') === 'on'
  const street = data.get('street')?.toString()
  const street2 = data.get('street2')?.toString()
  const city = data.get('city')?.toString()
  const state = data.get('state')?.toString()
  const postalCode = data.get('postalCode')?.toString()
  const country = data.get('country')?.toString()

  if (!id || !type || !street || !city || !state || !postalCode || !country) {
    throw new Error('Missing required fields')
  }

  if (isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, session.user.id))
  }

  await db
    .update(addresses)
    .set({
      type,
      isDefault,
      street,
      street2: street2 || null,
      city,
      state,
      postalCode,
      country,
      updatedAt: new Date(),
    })
    .where(eq(addresses.id, id))

  revalidatePath('/account/addresses')
  return { success: true }
}
