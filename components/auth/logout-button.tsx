'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/login?error=logout_failed')
    }
  }

  return (
    <Button
      onClick={() => signOut()}
      variant='outline'
      className='hover:bg-destructive hover:text-destructive-foreground'
    >
      Sign Out
    </Button>
  )
}
