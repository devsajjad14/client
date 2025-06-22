// components/account/profile-form.tsx
'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/lib/actions/account'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { toast } from 'sonner'

type FormState = {
  error?: string
  success?: boolean
} | null

type Profile = {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  avatarUrl?: string | null
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updateProfile,
    null
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.success) {
      toast.success(
        profile?.firstName
          ? 'Profile updated successfully'
          : 'Profile created successfully'
      )
    }
  }, [state, profile?.firstName])

  return (
    <form action={formAction} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='firstName' className='block text-sm font-medium mb-1'>
            First Name
          </label>
          <Input
            id='firstName'
            name='firstName'
            defaultValue={profile?.firstName || ''}
            placeholder='First name'
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor='lastName' className='block text-sm font-medium mb-1'>
            Last Name
          </label>
          <Input
            id='lastName'
            name='lastName'
            defaultValue={profile?.lastName || ''}
            placeholder='Last name'
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label htmlFor='phone' className='block text-sm font-medium mb-1'>
          Phone Number
        </label>
        <Input
          id='phone'
          name='phone'
          defaultValue={profile?.phone || ''}
          placeholder='Phone number'
          disabled={isPending}
        />
      </div>

      <div className='pt-2'>
        <Button type='submit' disabled={isPending}>
          {isPending
            ? 'Saving...'
            : profile?.firstName
            ? 'Save Changes'
            : 'Create Profile'}
        </Button>
      </div>
    </form>
  )
}
