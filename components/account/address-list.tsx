// components/account/address-list.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { AddressCard } from './address-card'
import { Icons } from '@/components/icons'
import { Address } from '@/types/address'

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [optimisticAddrs, removeAddr] = useOptimistic(
    addresses,
    (state, idToRemove) => state.filter((addr) => addr.id !== idToRemove)
  )

  const [, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    startTransition(async () => {
      removeAddr(id)
      await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    })
  }

  return (
    <div className='space-y-6'>
      {optimisticAddrs.length === 0 ? (
        <div className='text-center py-12'>
          <div className='mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
            <Icons.mapPin className='h-10 w-10 text-gray-400 dark:text-gray-500' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            No saved addresses
          </h3>
          <p className='text-muted-foreground mt-2'>
            Get started by adding your first address
          </p>
          <a
            href='/account/addresses/new'
            className='mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors'
          >
            <Icons.plus className='h-4 w-4 mr-2' />
            Add New Address
          </a>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {optimisticAddrs.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={() => handleDelete(address.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
