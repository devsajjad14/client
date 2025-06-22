// app/account/profile/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/account/profile-form'
import { getProfile } from '@/lib/actions/account'
import { AccountSection } from '@/components/account/section'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Get profile or create empty object if none exists
  const profile = (await getProfile()) || {
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: null,
  }

  return (
    <AccountSection
      title='Profile Information'
      description='Manage your personal details'
    >
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Profile Picture Section */}
        <div className='md:w-1/3 space-y-6'>
          <div className='space-y-4'>
            <div className='relative mx-auto h-32 w-32 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg'>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt='Profile'
                  className='h-full w-full object-cover'
                  width={128}
                  height={128}
                />
              ) : (
                <Icons.user className='h-full w-full p-8 text-gray-400' />
              )}
            </div>
            <div className='text-center'>
              <h3 className='text-lg font-medium'>
                {session.user.name || 'Your Name'}
              </h3>
              <p className='text-muted-foreground text-sm'>
                {session.user.email}
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <Button variant='outline' className='w-full' disabled>
              <Icons.upload className='h-4 w-4 mr-2' />
              Change Photo
            </Button>
            <Button variant='outline' className='w-full' disabled>
              <Icons.key className='h-4 w-4 mr-2' />
              Change Password
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <div className='md:w-2/3'>
          <ProfileForm profile={profile} />
        </div>
      </div>
    </AccountSection>
  )
}
