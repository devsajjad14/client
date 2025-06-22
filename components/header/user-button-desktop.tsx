// components/header/user-button-desktop.tsx
'use client'

import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { User } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'

export default function UserButtonDesktop() {
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        setUser(data?.user ?? null)
      } catch (error) {
        console.error('Failed to load session:', error)
      }
    }

    if (!user) {
      loadSession()
    }
  }, [user, setUser])

  if (!user) {
    return (
      <Link href='/login'>
        <Button variant='outline' className='flex items-center gap-2'>
          <User className='w-4 h-4' />
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex items-center gap-2'>
          <span className='hidden sm:inline'>{user.name}</span>
          <User className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuItem asChild>
          <Link href='/account'>Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
