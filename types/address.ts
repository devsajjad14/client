// lib/types/address.ts
export type Address = {
  id: string
  userId: string
  type: 'billing' | 'shipping'
  isDefault: boolean
  street: string
  street2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  createdAt: Date | null
  updatedAt: Date | null
}
