import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SignupForm } from '@/components/auth/signup-form'
import { SocialLogin } from '@/components/auth/social-login'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const session = await auth()

  if (session) {
    redirect(decodeURIComponent(resolvedSearchParams.callbackUrl || '/account'))
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8'>
      <div className='w-full max-w-md transform rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 sm:scale-100 sm:hover:shadow-2xl'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Create Account</h1>
          <p className='mt-2 text-sm text-gray-600'>
            Get started with your account today
          </p>
        </div>

        <div className='space-y-6'>
          <div className='flex justify-center gap-3'>
            <SocialLogin provider='google' />
            <SocialLogin provider='facebook' />
            <SocialLogin provider='x' />
          </div>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-white px-2 text-gray-500'>
                Or register with email
              </span>
            </div>
          </div>

          <SignupForm callbackUrl={resolvedSearchParams.callbackUrl} />
        </div>

        <div className='mt-6 text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <Link
            href={`/login${
              resolvedSearchParams.callbackUrl
                ? `?callbackUrl=${encodeURIComponent(
                    resolvedSearchParams.callbackUrl
                  )}`
                : ''
            }`}
            className='font-medium text-primary-600 hover:text-primary-500 hover:underline'
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
