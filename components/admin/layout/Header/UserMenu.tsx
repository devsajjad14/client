'use client'

import { useState } from 'react'
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserMenu() {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center space-x-2 focus:outline-none'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/avatars/admin.png' alt='Admin Avatar' />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className='hidden md:inline-block font-medium dark:text-white'>
            Admin
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuItem className='cursor-pointer'>
          <FiUser className='mr-2' />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer'>
          <FiSettings className='mr-2' />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400'>
          <FiLogOut className='mr-2' />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
