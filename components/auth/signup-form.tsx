'use client'

import { useActionState, useEffect } from 'react'
import { signupAction } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ActionState {
  error?: string
  message?: string
  callbackUrl?: string
  redirect?: string
}

export function SignupForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(signupAction, {
    error: '',
    message: undefined,
    callbackUrl: callbackUrl || '/account',
  })
  const router = useRouter()

  useEffect(() => {
    if (state?.message && !state?.error) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        const loginUrl = new URL('/login', window.location.origin)
        loginUrl.searchParams.set(
          'success',
          'Account created successfully! Please sign in.'
        )
        if (state.callbackUrl) {
          loginUrl.searchParams.set('callbackUrl', state.callbackUrl)
        }
        router.push(loginUrl.toString() as string)
      }, 1500)
      return () => clearTimeout(timer)
    }
    
    // Handle direct redirect after successful signup and auto-login
    if (state?.redirect && !state?.error) {
      router.push(state.redirect)
    }
  }, [state, router])

  return (
    <form action={formAction} className='space-y-4'>
      <input
        type='hidden'
        name='callbackUrl'
        value={callbackUrl || '/account'}
      />

      <div className='space-y-3'>
        <label
          htmlFor='name'
          className='block text-sm font-medium text-gray-700'
        >
          Full name
        </label>
        <Input
          id='name'
          name='name'
          type='text'
          placeholder='Enter your full name'
          required
          className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
        />
      </div>

      <div className='space-y-3'>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-700'
        >
          Email address
        </label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='Enter your email'
          required
          className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
        />
      </div>

      <div className='space-y-3'>
        <label
          htmlFor='password'
          className='block text-sm font-medium text-gray-700'
        >
          Password
        </label>
        <Input
          id='password'
          name='password'
          type='password'
          placeholder='Create a password (min 6 characters)'
          required
          minLength={6}
          className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500'
        />
      </div>

      <Button
        type='submit'
        className='w-full rounded-md bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer'
        disabled={isPending}
      >
        {isPending ? 'Creating account...' : 'Sign Up'}
      </Button>

      {state?.error && (
        <p className='mt-2 text-center text-sm text-red-600'>{state.error}</p>
      )}

      {state?.message && (
        <div className='rounded-lg bg-green-50 p-3 text-center'>
          <p className='text-sm text-green-600'>{state.message}</p>
          <p className='mt-1 text-xs text-gray-500'>Redirecting to login...</p>
        </div>
      )}
    </form>
  )
}
