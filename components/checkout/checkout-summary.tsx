'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/solid'

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '' // Return empty string if url is not provided
  try {
    const urlObj = new URL(url, 'https://www.alumnihall.com')
    const filename = urlObj.pathname.split('/').pop() || ''
    return `https://www.alumnihall.com/prodimages/${filename}?w=80&q=75`
  } catch {
    return url
  }
}

export default function CheckoutSummary() {
  const { items, getTotalItems, getTotalPrice, shippingCost } = useCartStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const subtotal = getTotalPrice() - shippingCost
  const tax = (subtotal + shippingCost) * 0.08 // 8% tax
  const total = subtotal + shippingCost + tax

  if (!isMounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] border border-white/20'
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-bold text-gray-900 tracking-tight'>
          Order Summary
        </h2>
        <span className='text-xs font-medium bg-black text-white px-2 py-1 rounded-full'>
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Order Items - Premium Scrollable List */}
      <div className='max-h-[300px] overflow-y-auto pr-2 -mr-2 custom-scrollbar'>
        <ul className='divide-y divide-gray-200/50 p-4'>
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className='py-4 first:pt-0 last:pb-0'
            >
              <div className='flex gap-4'>
                <div className='flex-shrink-0 relative'>
                  <Image
                    src={getOptimizedImageUrl(item.image)}
                    alt={item.name}
                    width={80}
                    height={80}
                    unoptimized
                    className='rounded-lg object-cover w-20 h-20 border border-gray-200/50'
                  />
                  <span className='absolute -top-2 -right-2 bg-black text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center'>
                    {item.quantity}
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between gap-2'>
                    <h3 className='text-sm font-medium text-gray-900 truncate'>
                      {item.name}
                    </h3>
                    <p className='text-sm font-medium text-gray-900 whitespace-nowrap'>
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  {(item.color || item.size) && (
                    <div className='mt-1 flex flex-wrap gap-2'>
                      {item.color && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                          {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                          {item.size}
                        </span>
                      )}
                    </div>
                  )}
                  <div className='mt-2 flex items-center'>
                    <span className='text-xs text-gray-500'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Order Summary - Glass Panel */}
      <div className='mt-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 border border-gray-200/50'>
        <dl className='space-y-3'>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Subtotal</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${subtotal.toFixed(2)}
            </dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Shipping</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${shippingCost.toFixed(2)}
            </dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Tax</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${tax.toFixed(2)}
            </dd>
          </div>
          <div className='flex items-center justify-between pt-3 border-t border-gray-200/50'>
            <dt className='text-base font-bold text-gray-900'>Total</dt>
            <dd className='text-base font-bold text-gray-900'>
              ${total.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Delivery Estimate - Premium Card */}
      <div className='mt-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 border border-indigo-200/50'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 p-1.5 bg-indigo-100 rounded-lg'>
            <svg
              className='h-5 w-5 text-indigo-600'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-indigo-900'>
              Estimated delivery
            </h3>
            <p className='mt-1 text-sm text-indigo-800'>
              {new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Security Badge - Premium Glass */}
      <div className='mt-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 border border-gray-200/50'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 p-1.5 bg-green-100 rounded-lg'>
            <ShieldCheckIcon className='h-5 w-5 text-green-600' />
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-gray-900'>
              Secure Checkout
            </h3>
            <p className='mt-1 text-xs text-gray-600'>
              Your payment information is encrypted and secure. We never store
              your credit card details.
            </p>
            <div className='mt-3 flex items-center space-x-4'>
              <LockClosedIcon className='h-4 w-4 text-gray-500' />
              <span className='text-xs text-gray-500'>
                256-bit SSL encryption
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Icons */}
      <div className='mt-6 flex justify-center space-x-4'>
        <Image
          src='/images/checkout/visa.svg'
          alt='Visa'
          width={32}
          height={20}
          className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
        />
        <Image
          src='/images/checkout/mastercard.svg'
          alt='Mastercard'
          width={32}
          height={20}
          className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
        />
        <Image
          src='/images/checkout/amex.svg'
          alt='Amex'
          width={32}
          height={20}
          className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
        />
        <Image
          src='/images/checkout/paypal.svg'
          alt='PayPal'
          width={32}
          height={20}
          className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
        />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  )
}
