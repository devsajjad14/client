'use client'

import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { voteHelpful } from '@/lib/actions/reviews'
import Image from 'next/image'

interface Review {
  id: string
  user: {
    name: string
    image: string | null
  }
  rating: number
  title: string
  content: string
  created_at: string
  helpful_votes: number
  verified_purchase: boolean
}

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  const handleVoteHelpful = async (reviewId: string) => {
    await voteHelpful(reviewId)
  }

  return (
    <div className='space-y-6'>
      {reviews.map((review) => (
        <div key={review.id} className='border-b pb-6'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-10 rounded-full bg-gray-200'>
                {review.user.image && (
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    width={40}
                    height={40}
                    className='h-full w-full rounded-full object-cover'
                  />
                )}
              </div>
              <div>
                <p className='font-medium'>{review.user.name}</p>
                <div className='flex items-center gap-1'>
                  <div className='flex'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.verified_purchase && (
                    <span className='text-xs text-green-600'>
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className='text-sm text-gray-500'>
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>

          <h3 className='mt-2 font-medium'>{review.title}</h3>
          <p className='mt-1 text-gray-600'>{review.content}</p>

          <div className='mt-4 flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleVoteHelpful(review.id)}
            >
              Helpful ({review.helpful_votes})
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
