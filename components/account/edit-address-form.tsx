// components/account/edit-address-form.tsx
'use client'

import { updateAddress } from '@/lib/actions/account'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useFormState } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

type FormState = {
  error?: string
  success?: boolean
} | null

type Address = {
  id: string
  type: 'billing' | 'shipping'
  isDefault: boolean
  street: string
  street2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

export function EditAddressForm({ address }: { address: Address }) {
  const [state, formAction] = useFormState<FormState, FormData>(
    (state, payload) => updateAddress(payload),
    null
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.success) {
      toast.success('Address updated successfully')
    }
  }, [state])

  return (
    <form action={formAction} className='space-y-4'>
      <input type='hidden' name='id' value={address.id} />

      <div className='space-y-2'>
        <Label htmlFor='type'>Address Type</Label>
        <div className='flex gap-4' id='type'>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id='shipping'
              name='type'
              value='shipping'
              defaultChecked={address.type === 'shipping'}
              className='h-4 w-4'
              required
            />
            <Label htmlFor='shipping'>Shipping</Label>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id='billing'
              name='type'
              value='billing'
              defaultChecked={address.type === 'billing'}
              className='h-4 w-4'
              required
            />
            <Label htmlFor='billing'>Billing</Label>
          </div>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='street'>Street Address</Label>
        <Input
          id='street'
          name='street'
          defaultValue={address.street}
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='street2'>Apartment, Suite, etc. (Optional)</Label>
        <Input
          id='street2'
          name='street2'
          defaultValue={address.street2 || ''}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='city'>City</Label>
          <Input id='city' name='city' defaultValue={address.city} required />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='state'>State/Province</Label>
          <Input
            id='state'
            name='state'
            defaultValue={address.state}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='postalCode'>Postal Code</Label>
          <Input
            id='postalCode'
            name='postalCode'
            defaultValue={address.postalCode}
            required
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='country'>Country</Label>
        <Input
          id='country'
          name='country'
          defaultValue={address.country}
          required
        />
      </div>

      <div className='flex items-center space-x-2 pt-2'>
        <Checkbox
          id='isDefault'
          name='isDefault'
          defaultChecked={address.isDefault}
        />
        <Label htmlFor='isDefault'>Set as default address</Label>
      </div>

      <div className='pt-4 flex justify-end gap-2'>
        <Button variant='outline' asChild>
          <Link href='/account/addresses'>Cancel</Link>
        </Button>
        <Button type='submit'>Save Changes</Button>
      </div>
    </form>
  )
}
