'use client'

import { useState } from 'react'
import { createProductReview } from '@/lib/actions/product/productReviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/ui/star-rating'
import { toast } from 'sonner'

interface WriteReviewFormProps {
  productId: string
  onSuccess?: () => void
}

export function WriteReviewForm({
  productId,
  onSuccess,
}: WriteReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true)
      const data = {
        productId,
        rating,
        title: formData.get('title') as string,
        content: formData.get('content') as string,
      }
      const result = await createProductReview(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Review submitted successfully!')
        onSuccess?.()
      }
    } catch {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        handleSubmit(formData)
      }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Title</label>
        <Input
          name='title'
          placeholder='Give your review a title'
          required
          minLength={5}
          maxLength={100}
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Review</label>
        <Textarea
          name='content'
          placeholder='Share your experience with this product'
          required
          minLength={10}
          maxLength={1000}
          className='min-h-[150px]'
        />
      </div>

      <Button type='submit' disabled={isSubmitting || rating === 0}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
