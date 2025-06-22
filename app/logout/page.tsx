'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut({ redirect: false })
        router.push('/login')
        router.refresh()
      } catch (error) {
        console.error('Logout failed:', error)
        router.push('/login?error=logout_failed')
      }
    }

    performLogout()
  }, [router])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
      <Loader2 className='w-8 h-8 animate-spin' />
      <p>Signing out...</p>
    </div>
  )
}
