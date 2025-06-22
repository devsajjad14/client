'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  profileImage: string | null
}

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/admin')
    }
  }, [shouldRedirect, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login')
      }

      // Store admin session and user data
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminUser', JSON.stringify(data))
      setAdminUser(data)

      // Add a small delay before showing the welcome screen
      setTimeout(() => {
        setIsProcessing(false)
        setIsLoading(true)
      }, 1000)

      // Simulate loading progress over 5 seconds
      const totalDuration = 5000 // 5 seconds
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setShouldRedirect(true)
            return 100
          }
          return prev + (100 / (totalDuration / 40)) // Update every 40ms to reach 100% in 5 seconds
        })
      }, 40)

      return () => clearInterval(interval)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login')
      setIsProcessing(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-8'>
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='text-center'
            >
              <div className='flex justify-center mb-8'>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className='relative'
                >
                  <div className='absolute inset-0 bg-[#0066ff] rounded-full blur-2xl opacity-30 animate-pulse'></div>
                  <div className='relative h-32 w-32 rounded-full bg-gradient-to-br from-[#0066ff] to-[#2563eb] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden'>
                    {adminUser?.profileImage ? (
                      <Image
                        src={adminUser.profileImage}
                        alt={adminUser.name}
                        width={128}
                        height={128}
                        className='object-cover'
                        priority
                      />
                    ) : (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        aria-hidden='true'
                        data-slot='icon'
                        className='h-20 w-20 text-white'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                        />
                      </svg>
                    )}
                  </div>
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='text-3xl font-bold bg-gradient-to-r from-[#0066ff] to-[#2563eb] bg-clip-text text-transparent mb-6'
              >
                Welcome Back, {adminUser?.name?.split(' ')[0]}!
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='space-y-8'
              >
                <div className='relative'>
                  <div className='w-full h-2 bg-[#e6f0ff]/50 rounded-full overflow-hidden backdrop-blur-sm'>
                    <motion.div
                      className='h-full bg-gradient-to-r from-[#0066ff] to-[#2563eb] relative'
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className='absolute inset-0 bg-white/20 animate-pulse'></div>
                    </motion.div>
                  </div>
                  <div className='absolute -bottom-8 left-0 right-0 flex justify-between text-sm font-medium text-[#0066ff]'>
                    <span>Loading</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className='text-[#0066ff] text-lg font-medium'
                >
                  Preparing your dashboard...
                </motion.p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'
            >
              <div className='text-center'>
                <div className='flex justify-center mb-6'>
                  <div className='h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth='1.5'
                      stroke='currentColor'
                      aria-hidden='true'
                      data-slot='icon'
                      className='h-12 w-12 text-white'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                      />
                    </svg>
                  </div>
                </div>
                <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                  Admin Portal
                </h2>
                <p className='text-sm text-gray-600 mb-8'>
                  Enter your credentials to access the admin panel
                </p>
              </div>

              <form onSubmit={handleLogin} className='space-y-6'>
                <div>
                  <label
                    htmlFor='username'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Username
                  </label>
                  <input
                    id='username'
                    name='username'
                    type='text'
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                    placeholder='Enter your username'
                  />
                </div>

                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Password
                  </label>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                    placeholder='Enter your password'
                  />
                </div>

                <div className='space-y-4'>
                  <button
                    type='submit'
                    disabled={isProcessing || isLoading}
                    className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isProcessing ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                        <span>Processing...</span>
                      </div>
                    ) : isLoading ? (
                      'Signing in...'
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='flex items-center justify-center space-x-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100'
                      >
                        <svg
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
