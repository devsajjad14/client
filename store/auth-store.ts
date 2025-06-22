// lib/stores/auth-store.ts
import { create } from 'zustand'

type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
} | null

interface AuthState {
  user: User
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
