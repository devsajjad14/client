// app/account/addresses/new/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountSection } from '@/components/account/section'
import { NewAddressForm } from '@/components/account/new-address-form'

export default async function NewAddressPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <AccountSection
      title='Add New Address'
      description='Add a new shipping or billing address'
    >
      <NewAddressForm />
    </AccountSection>
  )
}
