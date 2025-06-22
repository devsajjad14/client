// components/header/user-button.tsx
'use client'

import dynamic from 'next/dynamic'
import { UserButtonSkeleton } from '../skeletons/user-button-skeleton'

const UserButtonDesktop = dynamic(() => import('./user-button-desktop'), {
  loading: () => <UserButtonSkeleton />,
})

export default function UserButton() {
  return <UserButtonDesktop />
}
