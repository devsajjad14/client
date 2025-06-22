// components/account/new-address-form.tsx
'use client'

import { useActionState } from 'react'
import { createAddress } from '@/lib/actions/account'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

type FormState = {
  error?: string
  fieldErrors?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  success?: boolean
} | null

export function NewAddressForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    createAddress,
    null
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.success) {
      toast.success('Address created successfully')
    }
  }, [state])

  return (
    <form action={formAction} className='space-y-4'>
      {/* Address Type Radio Group */}
      <div className='space-y-2'>
        <Label htmlFor='type'>Address Type *</Label>
        <div className='flex gap-4' id='type'>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id='shipping'
              name='type'
              value='shipping'
              defaultChecked
              className='h-4 w-4 text-primary focus:ring-primary border-gray-300'
              required
              disabled={isPending}
            />
            <Label htmlFor='shipping'>Shipping</Label>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id='billing'
              name='type'
              value='billing'
              className='h-4 w-4 text-primary focus:ring-primary border-gray-300'
              required
              disabled={isPending}
            />
            <Label htmlFor='billing'>Billing</Label>
          </div>
        </div>
      </div>

      {/* Street Address */}
      <div className='space-y-2'>
        <Label htmlFor='street'>Street Address *</Label>
        <Input
          id='street'
          name='street'
          required
          disabled={isPending}
          aria-invalid={!!state?.fieldErrors?.street}
          aria-describedby='street-error'
        />
        {state?.fieldErrors?.street && (
          <p id='street-error' className='text-sm text-destructive'>
            {state.fieldErrors.street}
          </p>
        )}
      </div>

      {/* Apartment/Suite */}
      <div className='space-y-2'>
        <Label htmlFor='street2'>Apartment, Suite, etc. (Optional)</Label>
        <Input id='street2' name='street2' disabled={isPending} />
      </div>

      {/* City/State/Zip Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* City */}
        <div className='space-y-2'>
          <Label htmlFor='city'>City *</Label>
          <Input
            id='city'
            name='city'
            required
            disabled={isPending}
            aria-invalid={!!state?.fieldErrors?.city}
            aria-describedby='city-error'
          />
          {state?.fieldErrors?.city && (
            <p id='city-error' className='text-sm text-destructive'>
              {state.fieldErrors.city}
            </p>
          )}
        </div>

        {/* State */}
        <div className='space-y-2'>
          <Label htmlFor='state'>State/Province *</Label>
          <Input
            id='state'
            name='state'
            required
            disabled={isPending}
            aria-invalid={!!state?.fieldErrors?.state}
            aria-describedby='state-error'
          />
          {state?.fieldErrors?.state && (
            <p id='state-error' className='text-sm text-destructive'>
              {state.fieldErrors.state}
            </p>
          )}
        </div>

        {/* Postal Code */}
        <div className='space-y-2'>
          <Label htmlFor='postalCode'>Postal Code *</Label>
          <Input
            id='postalCode'
            name='postalCode'
            required
            disabled={isPending}
            aria-invalid={!!state?.fieldErrors?.postalCode}
            aria-describedby='postalCode-error'
          />
          {state?.fieldErrors?.postalCode && (
            <p id='postalCode-error' className='text-sm text-destructive'>
              {state.fieldErrors.postalCode}
            </p>
          )}
        </div>
      </div>

      {/* Country */}
      <div className='space-y-2'>
        <Label htmlFor='country'>Country *</Label>
        <Input
          id='country'
          name='country'
          required
          disabled={isPending}
          aria-invalid={!!state?.fieldErrors?.country}
          aria-describedby='country-error'
        />
        {state?.fieldErrors?.country && (
          <p id='country-error' className='text-sm text-destructive'>
            {state.fieldErrors.country}
          </p>
        )}
      </div>

      {/* Default Address Checkbox */}
      <div className='flex items-center space-x-2 pt-2'>
        <Checkbox id='isDefault' name='isDefault' disabled={isPending} />
        <Label htmlFor='isDefault'>Set as default address</Label>
      </div>

      {/* Form Actions */}
      <div className='pt-4 flex justify-end gap-2'>
        <Button variant='outline' asChild disabled={isPending}>
          <Link href='/account/addresses'>Cancel</Link>
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            'Save Address'
          )}
        </Button>
      </div>
    </form>
  )
}
