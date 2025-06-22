// components/icons.tsx
import * as React from 'react'
import { LucideProps } from 'lucide-react'
import {
  GitHubLogoIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'

import {
  User,
  MapPin,
  Package,
  Heart,
  ChevronRight,
  Trash,
  Edit,
  Plus,
  Home,
  Lock,
  LayoutDashboard,
  CreditCard,
  Bell,
  Activity,
  Upload,
  Key,
  Loader2 as Spinner, // Using Loader2 as an alternative for Spinner
} from 'lucide-react'

export const Icons = {
  // Social media icons (your existing custom SVGs)
  google: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 24 24'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  ),
  facebook: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 24 24'>
      <path
        fill='#1877F2'
        d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
      />
    </svg>
  ),
  twitter: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
      />
    </svg>
  ),
  x: (props: LucideProps) => (
    <svg {...props} viewBox='0 0 24 24'>
      <path
        fill='currentColor'
        d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
      />
    </svg>
  ),

  github: GitHubLogoIcon,
  email: EnvelopeClosedIcon,
  password: LockClosedIcon,
  user: PersonIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircledIcon,

  // Lucide icons
  userLucide: User,
  mapPin: MapPin,
  package: Package,
  heart: Heart,
  chevronRight: ChevronRight,
  trash: Trash,
  edit: Edit,
  plus: Plus,
  home: Home,
  lock: Lock,
  dashboard: LayoutDashboard,
  creditCard: CreditCard,
  bell: Bell,
  activity: Activity,
  upload: Upload,
  key: Key,
  spinner: Spinner,
}
