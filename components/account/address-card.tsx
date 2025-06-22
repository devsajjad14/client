import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { Address } from '@/types/address'

export function AddressCard({
  address,
  onDelete,
}: {
  address: Address
  onDelete: () => void
}) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
            {address.type} Address
            {address.isDefault && (
              <span className='text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full'>
                Default
              </span>
            )}
          </h3>
        </div>
        <div className='flex gap-1'>
          <Button
            variant='ghost'
            size='sm'
            asChild
            className='hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <Link href={`/account/addresses/${address.id}`}>
              <Icons.edit className='h-4 w-4' />
            </Link>
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={onDelete}
            className='hover:bg-red-50 dark:hover:bg-red-900/20'
          >
            <Icons.trash className='h-4 w-4 text-red-500 dark:text-red-400' />
          </Button>
        </div>
      </div>

      <div className='mt-4 text-sm space-y-1 text-gray-600 dark:text-gray-300'>
        <p>{address.street}</p>
        {address.street2 && <p>{address.street2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </div>
    </div>
  )
}
