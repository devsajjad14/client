// app/account/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountCard, AccountSection } from '@/components/account/section'
import { Icons } from '@/components/icons'

export default async function AccountPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <AccountSection
      title='Your Account Dashboard'
      description='Quick access to your account management'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AccountCard
          title='Profile Details'
          description='View and edit personal information'
          icon={<Icons.user className='h-6 w-6' />}
          href='/account/profile'
        />
        <AccountCard
          title='Address Book'
          description='Manage shipping & billing addresses'
          icon={<Icons.mapPin className='h-6 w-6' />}
          href='/account/addresses'
        />
        <AccountCard
          title='Order History'
          description='View past purchases and tracking'
          icon={<Icons.package className='h-6 w-6' />}
          href='/account/orders'
          disabled
        />
        <AccountCard
          title='Payment Methods'
          description='Manage saved payment options'
          icon={<Icons.creditCard className='h-6 w-6' />}
          href='/account/payments'
          disabled
        />
        <AccountCard
          title='Security Settings'
          description='Password and authentication'
          icon={<Icons.lock className='h-6 w-6' />}
          href='/account/security'
          disabled
        />
        <AccountCard
          title='Notifications'
          description='Manage email preferences'
          icon={<Icons.bell className='h-6 w-6' />}
          href='/account/notifications'
          disabled
        />
      </div>

      <div className='mt-12 border-t pt-8'>
        <h3 className='text-lg font-medium mb-4'>Recent Activity</h3>
        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center'>
          <Icons.activity className='mx-auto h-8 w-8 text-gray-400 mb-2' />
          <p className='text-gray-500 dark:text-gray-400'>
            Your recent account activity will appear here
          </p>
        </div>
      </div>
    </AccountSection>
  )
}
