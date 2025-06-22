// components/auth/session-sync.tsx
'use client'

import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

export function SessionSync({ initialUser }: { initialUser: User }) {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser, setUser])

  return null
}
