'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { submitReview } from '@/lib/actions/reviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  productId: string
}

interface FormState {
  success: boolean
  error?: string
  review?: {
    title: string
    content: string
    rating: number
  }
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [state, formAction] = useFormState<FormState, FormData>(
    async (prevState, formData) => {
      return await submitReview(formData)
    },
    { success: false }
  )

  return (
    <form action={formAction} className='space-y-4'>
      <input type='hidden' name='productId' value={productId} />

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Rating</label>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type='button'
              onClick={() => setRating(star)}
              className='text-yellow-400 hover:text-yellow-500'
            >
              <Star
                className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`}
              />
            </button>
          ))}
        </div>
        <input type='hidden' name='rating' value={rating} />
      </div>

      <div className='space-y-2'>
        <label htmlFor='title' className='text-sm font-medium'>
          Review Title
        </label>
        <Input
          id='title'
          name='title'
          placeholder='Summarize your experience'
          required
        />
      </div>

      <div className='space-y-2'>
        <label htmlFor='content' className='text-sm font-medium'>
          Review Content
        </label>
        <Textarea
          id='content'
          name='content'
          placeholder='Share your thoughts about this product'
          required
          rows={4}
        />
      </div>

      <Button type='submit' disabled={rating === 0}>
        Submit Review
      </Button>

      {state.error && <p className='text-sm text-red-500'>{state.error}</p>}
    </form>
  )
}
