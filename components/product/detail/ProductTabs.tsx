'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  getProductReviews,
  getProductReviewStats,
} from '@/lib/actions/product/productReviews'
import { WriteReviewForm } from './WriteReviewForm'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title: string
  content: string
  images?: string[]
  verifiedPurchase: boolean
  helpfulVotes?: number
  createdAt: Date
  user: {
    name: string
    image: string | null
  }
}

interface ProductTabsProps {
  productId: string
  onReviewSubmit?: () => void
}

export function ProductTabs({ productId, onReviewSubmit }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('reviews')
  const [isHovered, setIsHovered] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [] as number[],
  })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchReviews = async () => {
      const { reviews: fetchedReviews } = await getProductReviews(productId)
      const { averageRating, totalReviews, ratingDistribution } =
        await getProductReviewStats(productId)

      setReviews(fetchedReviews)
      setStats({
        averageRating,
        totalReviews,
        ratingDistribution,
      })
    }

    fetchReviews()
  }, [productId])

  const handleReviewSubmit = () => {
    setShowReviewForm(false)
    // Refresh reviews after submission
    const fetchReviews = async () => {
      const { reviews: fetchedReviews } = await getProductReviews(productId)
      const { averageRating, totalReviews, ratingDistribution } =
        await getProductReviewStats(productId)

      setReviews(fetchedReviews)
      setStats({
        averageRating,
        totalReviews,
        ratingDistribution,
      })
      // Call the parent's refresh function
      onReviewSubmit?.()
    }

    fetchReviews()
  }

  // Modern floating action button style
  const WriteReviewButton = () => (
    <motion.button
      className='
      fixed bottom-6 right-6 z-50
      w-12 h-12 rounded-full
      bg-gradient-to-br from-indigo-600 to-purple-600
      shadow-md hover:shadow-lg
      transition-all duration-300
      group
      md:w-auto md:h-auto md:px-4 md:py-2 md:rounded-lg
      focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
    '
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        boxShadow: isHovered
          ? '0 10px 25px -5px rgba(124, 58, 237, 0.3)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setShowReviewForm(true)}
      aria-label='Write a review'
    >
      {/* Mobile icon (smaller) */}
      <motion.div
        className='md:hidden flex items-center justify-center'
        animate={{
          scale: isHovered ? [1, 1.05, 1] : 1,
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5 text-white'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
          />
        </svg>
      </motion.div>

      {/* Desktop text + icon (compact) */}
      <motion.span className='hidden md:inline-flex items-center gap-1.5 text-sm text-white font-medium'>
        <motion.div
          animate={{
            rotate: isHovered ? [0, 5, -3, 0] : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
            />
          </svg>
        </motion.div>
        Write a Review
      </motion.span>

      {/* Subtle glow effect */}
      {isHovered && (
        <motion.div
          className='absolute inset-0 rounded-full pointer-events-none'
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
          }}
        />
      )}
    </motion.button>
  )

  return (
    <div className='relative'>
      {/* Modern Glass Morphism Tabs */}
      <div className='bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-sm overflow-hidden'>
        <nav className='flex border-b border-gray-200/50'>
          {['reviews', 'shipping'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-4 text-sm font-medium relative
                transition-all duration-300 flex-1 text-center
                ${
                  activeTab === tab
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab === 'reviews' ? 'Customer Reviews' : 'Shipping & Returns'}
              {activeTab === tab && (
                <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full'></span>
              )}
            </button>
          ))}
        </nav>

        {/* Persistent Reviews Content */}
        <div className={`p-6 ${activeTab !== 'reviews' ? 'hidden' : ''}`}>
          <div className='space-y-6'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div>
                <h3 className='text-2xl font-bold text-gray-900'>
                  Customer Reviews
                </h3>
                <div className='flex items-center gap-3 mt-2'>
                  <div className='flex items-center'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(stats.averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    ))}
                  </div>
                  <span className='text-sm text-gray-600'>
                    {stats.totalReviews > 0
                      ? `${stats.averageRating.toFixed(1)} out of 5 • ${
                          stats.totalReviews
                        } reviews`
                      : 'No reviews yet'}
                  </span>
                </div>
              </div>
              <div className='md:hidden'>
                <WriteReviewButton />
              </div>
            </div>

            {/* Reviews Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className='bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-gray-200/50 shadow-xs hover:shadow-sm transition-shadow'
                >
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-medium text-lg'>
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name}
                          width={48}
                          height={48}
                          className='w-full h-full rounded-full object-cover'
                        />
                      ) : (
                        review.user.name.charAt(0)
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            {review.user.name}
                          </h4>
                          <div className='flex items-center gap-2 mt-1'>
                            <div className='flex'>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill='currentColor'
                                  viewBox='0 0 20 20'
                                >
                                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                </svg>
                              ))}
                            </div>
                            <span className='text-xs text-gray-500'>
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        {review.verifiedPurchase && (
                          <span className='text-xs text-green-600 font-medium'>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <h5 className='font-medium text-gray-900 mt-2'>
                        {review.title}
                      </h5>
                      <p className='text-gray-600 mt-2'>{review.content}</p>
                      {review.images && review.images.length > 0 && (
                        <div className='flex gap-2 mt-4'>
                          {review.images.map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className='w-20 h-20 rounded-lg object-cover'
                              width={80}
                              height={80}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping & Returns Content */}
        <div className={`p-6 ${activeTab !== 'shipping' ? 'hidden' : ''}`}>
          {/* Shipping & Returns content */}
        </div>
      </div>

      {/* Write Review Button */}
      {session?.user && <WriteReviewButton />}

      {/* Write Review Modal */}
      {showReviewForm && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold'>Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <WriteReviewForm
              productId={productId}
              onSuccess={handleReviewSubmit}
            />
          </div>
        </div>
      )}
    </div>
  )
}
