// lib/validators/account.ts
import { z } from 'zod'

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().max(20).optional(),
})

export const addressSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  isDefault: z.boolean(),
  street: z.string().min(1, 'Street is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type AddressFormValues = z.infer<typeof addressSchema>
