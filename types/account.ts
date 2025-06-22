// lib/types/account.ts
export interface Profile {
  id?: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  avatarUrl?: string | null
}

export type FormState = {
  error?: string
  success?: boolean
} | null
