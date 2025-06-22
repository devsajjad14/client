// app/account/addresses/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AddressList } from '@/components/account/address-list'
import { getAddresses } from '@/lib/actions/account'
import { AccountSection } from '@/components/account/section'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export default async function AddressesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const addresses = await getAddresses()

  return (
    <AccountSection
      title='Address Book'
      description='Manage your shipping and billing addresses'
    >
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Saved Addresses
          </h3>
          <Button asChild>
            <a
              href='/account/addresses/new'
              className='flex items-center gap-2'
            >
              <Icons.plus className='h-4 w-4' />
              Add New Address
            </a>
          </Button>
        </div>

        <AddressList addresses={addresses} />
      </div>
    </AccountSection>
  )
}
