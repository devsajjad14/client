'use client'

import { useEffect, useTransition, useState } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LockClosedIcon, ArrowRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import { useActionState } from 'react'
import { signupAction } from '@/lib/actions/auth'
import { useAuthStore } from '@/store/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'

interface ActionState {
  error?: string
  message?: string
  callbackUrl?: string
  redirect?: string
}

export default function NotLoginCheckoutForm() {
  const [isPending] = useTransition()
  const [isReturningCustomerOpen, setIsReturningCustomerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const setUser = useAuthStore((state) => state.setUser)
  const [state, formAction] = useActionState<ActionState, FormData>(
    signupAction,
    {
      error: '',
      callbackUrl: '/checkout',
    }
  )

  // Handle redirect and session update after successful signup
  useEffect(() => {
    if (state?.redirect) {
      const updateSessionAndRedirect = async () => {
        let attempts = 0
        const maxAttempts = 5

        const getSession = async () => {
          console.log('Attempting to get session, attempt:', attempts + 1)
          const response = await fetch('/api/auth/session')
          if (!response.ok) {
            throw new Error('Failed to fetch session')
          }
          const data = await response.json()
          if (!data?.user) {
            if (attempts < maxAttempts) {
              attempts++
              const delay = Math.min(1000 * Math.pow(2, attempts), 8000)
              await new Promise((resolve) => setTimeout(resolve, delay))
              return getSession()
            }
            throw new Error(
              'Failed to get user session after multiple attempts'
            )
          }
          return data
        }

        try {
          const sessionData = await getSession()
          setUser(sessionData.user)
          console.log('Session updated successfully:', sessionData.user)
          window.location.href = state.redirect || '/checkout'
        } catch (error) {
          console.error('Session update error:', error)
          toast.error(
            'Failed to update session. Please try refreshing the page.'
          )
        }
      }

      updateSessionAndRedirect()
    }
  }, [state?.redirect, setUser])

  // Handle form errors
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state?.error])

  // Cache the handleReturningCustomerLogin function
  const handleReturningCustomerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError('Invalid email or password')
      } else {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        setUser(data?.user || null)
      }
    } catch (error: unknown) {
      console.log('Login error:', error)
      setLoginError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-2xl'>
        {/* Returning Customer Section */}
        <div className='mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200'>
          <button
            onClick={() => setIsReturningCustomerOpen(!isReturningCustomerOpen)}
            className='flex w-full items-center justify-between group'
          >
            <span className='text-sm font-medium text-gray-900 group-hover:text-black transition-colors duration-300'>
              Returning customer? Click to login
            </span>
            {isReturningCustomerOpen ? (
              <ChevronUpIcon className='ml-2 h-5 w-5 text-gray-500 group-hover:text-black transition-colors duration-300' />
            ) : (
              <ChevronDownIcon className='ml-2 h-5 w-5 text-gray-500 group-hover:text-black transition-colors duration-300' />
            )}
          </button>

          <AnimatePresence>
            {isReturningCustomerOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='mt-4 space-y-3 overflow-hidden'
                onSubmit={handleReturningCustomerLogin}
              >
                <div className='space-y-1'>
                  <label
                    htmlFor='email'
                    className='block text-xs font-medium text-gray-700'
                  >
                    Email address
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm transition-all duration-300 px-3 py-2 text-sm'
                    placeholder='your@email.com'
                    required
                  />
                </div>
                <div className='space-y-1'>
                  <label
                    htmlFor='password'
                    className='block text-xs font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <input
                    type='password'
                    id='password'
                    name='password'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm transition-all duration-300 px-3 py-2 text-sm'
                    placeholder='••••••••'
                    required
                  />
                </div>
                {loginError && (
                  <p className='text-sm text-red-500'>{loginError}</p>
                )}
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Header Section */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 rounded-full bg-black flex items-center justify-center'>
              <LockClosedIcon className='h-7 w-7 text-white' />
            </div>
          </div>
          <h2 className='text-3xl font-bold text-gray-900 tracking-tight'>
            Guest Checkout
          </h2>
          <p className='mt-3 text-sm text-gray-600'>
            Create your account to continue
          </p>
        </div>

        {/* Form Section */}
        <div className='bg-white p-8 rounded-lg shadow-lg'>
          <form action={formAction} className='space-y-8'>
            <input type='hidden' name='callbackUrl' value='/checkout' />

            <div className='space-y-3'>
              <Label
                htmlFor='name'
                className='text-sm font-medium text-gray-700 tracking-wide'
              >
                Full Name
              </Label>
              <div className='relative'>
                <Input
                  type='text'
                  id='name'
                  name='name'
                  required
                  placeholder='John Smith'
                  minLength={2}
                  className='w-full bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-md px-4 py-3.5 text-base placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700 tracking-wide'
              >
                Email
              </Label>
              <div className='relative'>
                <Input
                  type='email'
                  id='email'
                  name='email'
                  required
                  placeholder='your@email.com'
                  className='w-full bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-md px-4 py-3.5 text-base placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-gray-700 tracking-wide'
              >
                Password
              </Label>
              <div className='relative'>
                <Input
                  type='password'
                  id='password'
                  name='password'
                  required
                  placeholder='••••••••'
                  minLength={6}
                  className='w-full bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-md px-4 py-3.5 text-base placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
              </div>
              <p className='mt-2 text-xs text-gray-500'>
                Password must be at least 6 characters
              </p>
            </div>

            <button
              type='submit'
              disabled={isPending}
              className='w-full mt-12 flex justify-center items-center space-x-2 bg-black text-white px-8 py-4 rounded-lg text-sm font-medium tracking-wide hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl'
            >
              {isPending ? (
                <>
                  <svg
                    className='animate-spin h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Continue Checkout</span>
                  <ArrowRightIcon className='h-4 w-4' />
                </>
              )}
            </button>
          </form>

          {state?.error && (
            <div className='mt-8 p-4 rounded-lg bg-red-50 border border-red-200 text-center'>
              <p className='text-sm text-red-600'>{state.error}</p>
            </div>
          )}

          {state?.message && (
            <div className='mt-8 p-4 rounded-lg bg-green-50 border border-green-200 text-center'>
              <p className='text-sm text-green-600'>{state.message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className='mt-12 text-center text-xs text-gray-500'>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
