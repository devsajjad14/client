'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '' // Return empty string if url is not provided
  try {
    const urlObj = new URL(url, 'https://www.alumnihall.com')
    const filename = urlObj.pathname.split('/').pop() || ''
    return `https://www.alumnihall.com/prodimages/${filename}?w=96&q=75`
  } catch {
    return url
  }
}

export function CartPopup() {
  const {
    isOpen,
    closeCart,
    items,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
  } = useCartStore()

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        isOpen &&
        !target.closest('.cart-popup') &&
        !target.closest('.cart-trigger')
      ) {
        closeCart()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm' />
      <div className='absolute inset-y-0 right-0 flex max-w-full pl-10'>
        <div className='cart-popup relative w-screen max-w-md'>
          <div className='flex h-full flex-col bg-white shadow-xl'>
            <div className='flex-1 overflow-y-auto px-4 py-6 sm:px-6'>
              <div className='flex items-start justify-between'>
                <h2 className='text-lg font-medium text-gray-900'>
                  Shopping cart
                </h2>
                <button
                  type='button'
                  className='relative -m-2 p-2 text-gray-400 hover:text-gray-500'
                  onClick={closeCart}
                >
                  <span className='absolute -inset-0.5' />
                  <span className='sr-only'>Close panel</span>
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <div className='mt-8'>
                <div className='flow-root'>
                  {items.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12'>
                      <ShoppingBagIcon className='h-16 w-16 text-gray-400' />
                      <h3 className='mt-4 text-lg font-medium text-gray-900'>
                        Your cart is empty
                      </h3>
                      <p className='mt-1 text-gray-500'>
                        Start adding some items to your cart
                      </p>
                    </div>
                  ) : (
                    <ul className='-my-6 divide-y divide-gray-200'>
                      {items.map((item) => (
                        <li key={item.id} className='flex py-6'>
                          <div className='h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                            <Image
                              src={getOptimizedImageUrl(item.image)}
                              alt={item.name}
                              width={96}
                              height={96}
                              unoptimized
                              className='h-full w-full object-cover object-center'
                            />
                          </div>

                          <div className='ml-4 flex flex-1 flex-col'>
                            <div>
                              <div className='flex justify-between text-base font-medium text-gray-900'>
                                <h3>
                                  <Link href={`/product/${item.productId}`}>
                                    {item.name}
                                  </Link>
                                </h3>
                                <p className='ml-4'>${item.price.toFixed(2)}</p>
                              </div>
                              <p className='mt-1 text-sm text-gray-500'>
                                {item.color && <span>Color: {item.color}</span>}
                                {item.size && (
                                  <span className='ml-2'>
                                    Size: {item.size}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className='flex flex-1 items-end justify-between text-sm'>
                              <div className='flex items-center border border-gray-200 rounded-md'>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1}
                                  className='px-2 py-1 disabled:opacity-50'
                                >
                                  -
                                </button>
                                <span className='px-3'>{item.quantity}</span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  disabled={item.quantity >= item.maxQuantity}
                                  className='px-2 py-1 disabled:opacity-50'
                                >
                                  +
                                </button>
                              </div>

                              <div className='flex'>
                                <button
                                  type='button'
                                  className='font-medium text-red-600 hover:text-red-500'
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className='border-t border-gray-200 px-4 py-6 sm:px-6'>
                <div className='flex justify-between text-base font-medium text-gray-900'>
                  <p>Subtotal</p>
                  <p>${getTotalPrice().toFixed(2)}</p>
                </div>
                <p className='mt-0.5 text-sm text-gray-500'>
                  Shipping and taxes calculated at checkout.
                </p>
                <div className='mt-6 grid grid-cols-2 gap-4'>
                  <Link
                    href='/cart'
                    className='flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50'
                    onClick={closeCart}
                  >
                    View Cart
                  </Link>
                  <Link
                    href='/checkout'
                    className='flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700'
                    onClick={closeCart}
                  >
                    Checkout
                  </Link>
                </div>
                <div className='mt-4 flex justify-center text-center text-sm text-gray-500'>
                  <p>
                    or{' '}
                    <button
                      type='button'
                      className='font-medium text-black hover:text-gray-700'
                      onClick={closeCart}
                    >
                      Continue Shopping
                      <span aria-hidden='true'> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
