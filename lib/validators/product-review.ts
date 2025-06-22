import { z } from 'zod'

export const productReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
  images: z.array(z.string().url()).optional(),
})

export type ProductReviewInput = z.infer<typeof productReviewSchema> 