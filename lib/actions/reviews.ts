'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { reviews } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  images: z.array(z.string()).optional(),
})

interface ReviewWithUser {
  id: string
  userId: string
  productId: string
  rating: number
  title: string
  content: string
  images: string[] | null
  verifiedPurchase: boolean
  helpfulVotes: number
  createdAt: Date
  updatedAt: Date
  user: {
    name: string | null
    image: string | null
  } | null
}

export async function submitReview(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.userId) {
      throw new Error('You must be logged in to submit a review')
    }

    const validatedData = reviewSchema.parse({
      productId: formData.get('productId'),
      rating: Number(formData.get('rating')),
      title: formData.get('title'),
      content: formData.get('content'),
      images: formData.getAll('images'),
    })

    const [review] = await db
      .insert(reviews)
      .values({
        userId: session.userId,
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        images: validatedData.images,
        verifiedPurchase: true, // TODO: Check if user has purchased the product
      })
      .returning()

    revalidatePath(`/product/${validatedData.productId}`)
    return { success: true, review }
  } catch (error) {
    console.error('Error submitting review:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit review',
    }
  }
}

export async function getProductReviews(productId: string) {
  try {
    const productReviews = (await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: {
          columns: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    })) as ReviewWithUser[]

    return productReviews.map((review) => ({
      ...review,
      user: {
        name: review.user?.name ?? 'Anonymous',
        image: review.user?.image ?? null,
      },
    }))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function voteHelpful(reviewId: string) {
  try {
    const session = await auth()
    if (!session?.userId) {
      throw new Error('You must be logged in to vote')
    }

    await db
      .update(reviews)
      .set({
        helpfulVotes: sql`${reviews.helpfulVotes} + 1`,
      })
      .where(eq(reviews.id, reviewId))

    revalidatePath('/product/[id]')
    return { success: true }
  } catch (error) {
    console.error('Error voting helpful:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to vote',
    }
  }
}
