'use client'
import { useCartStore } from '@/lib/stores/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '' // Return empty string if url is not provided
  try {
    const urlObj = new URL(url, 'https://www.alumnihall.com')
    const filename = urlObj.pathname.split('/').pop() || ''
    return `https://www.alumnihall.com/prodimages/${filename}?w=128&q=75`
  } catch {
    return url
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export default function CartDetails() {
  const { items, removeFromCart, updateQuantity } = useCartStore()
  const [isMounted, setIsMounted] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => setIsMounted(true), [])

  const handleRemove = (id: string) => {
    setRemovingId(id)
    setTimeout(() => removeFromCart(id), 300)
  }

  if (!isMounted) return null
  if (items.length === 0) return <EmptyCart />

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Your{' '}
          <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Cart
          </span>
          <span className='ml-2 text-blue-600'>({items.length})</span>
        </h2>
        <button
          onClick={() => window.location.reload()}
          className='group flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors'
        >
          <ArrowPathIcon className='h-4 w-4 transition-transform group-hover:rotate-180' />
          Refresh
        </button>
      </div>

      {/* Cart Items */}
      <div className='divide-y divide-gray-200/80'>
        <AnimatePresence mode='popLayout'>
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              layout
              className={cn(
                'group relative py-6 overflow-hidden',
                removingId === item.id ? 'opacity-60' : ''
              )}
            >
              {/* Glow Effect */}
              <div className='absolute inset-0 -z-10 bg-gradient-to-r from-white via-blue-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity' />

              <div className='flex gap-4'>
                {/* Product Image */}
                <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200/50 bg-gray-50 shadow-inner sm:h-32 sm:w-32'>
                  <Image
                    src={getOptimizedImageUrl(item.image)}
                    alt={item.name}
                    fill
                    unoptimized
                    className='object-cover object-center transition-transform group-hover:scale-105'
                    sizes='(max-width: 640px) 100vw, 33vw'
                  />
                  <div className='absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white shadow-sm backdrop-blur-sm'>
                    ×{item.quantity}
                  </div>
                </div>

                {/* Product Info */}
                <div className='flex flex-1 flex-col'>
                  <div className='flex justify-between'>
                    <div>
                      <h3 className='text-base font-medium text-gray-900'>
                        <Link
                          href={`/product/${item.productId}`}
                          className='hover:text-blue-600 transition-colors hover:underline underline-offset-2'
                        >
                          {item.name}
                        </Link>
                      </h3>
                      <p className='mt-1 text-sm text-gray-500'>
                        {item.styleCode}
                      </p>
                    </div>
                    <p className='text-lg font-semibold text-gray-900'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Variant Chips */}
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {[item.color, item.size]
                      .filter(Boolean)
                      .map((variant, i) => (
                        <span
                          key={i}
                          className='inline-flex items-center rounded-full bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-800 backdrop-blur-sm border border-gray-200/50'
                        >
                          {variant}
                        </span>
                      ))}
                  </div>

                  {/* Quantity Selector */}
                  <div className='mt-4 flex items-center gap-3'>
                    <div className='flex items-center rounded-lg border border-gray-300/80 bg-white shadow-sm overflow-hidden'>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={item.quantity <= 1}
                        className='h-9 w-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30'
                      >
                        <svg
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M20 12H4'
                          />
                        </svg>
                      </button>
                      <input
                        type='number'
                        min='1'
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className='h-9 w-12 border-x border-gray-300/80 text-center text-sm font-medium [-moz-appearance:_textfield] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                      />
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.maxQuantity, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= item.maxQuantity}
                        className='h-9 w-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30'
                      >
                        <svg
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M12 4v16m8-8H4'
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      onClick={() => handleRemove(item.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className='ml-auto relative overflow-hidden rounded-full p-1.5'
                    >
                      <div className='absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-full' />
                      <XMarkIcon className='relative h-5 w-5 text-red-500 group-hover:text-white transition-colors' />
                      <motion.span
                        className='absolute inset-0 bg-white opacity-0 rounded-full'
                        initial={{ scale: 0.5 }}
                        whileTap={{
                          scale: 2,
                          opacity: 0.3,
                          transition: { duration: 0.5 },
                        }}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <div className='relative h-40 w-40'>
        <Image
          src='/empty-cart.svg'
          alt='Empty cart'
          fill
          className='object-contain'
        />
      </div>
      <h3 className='mt-6 text-lg font-medium text-gray-900'>
        Your cart is empty
      </h3>
      <p className='mt-1 text-gray-500'>Start shopping to add items</p>
      <Link
        href='/'
        className='mt-6 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity'
      >
        Continue Shopping
      </Link>
    </div>
  )
}
