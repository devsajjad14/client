'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { reviews, users } from '@/lib/db/schema'
import { productReviewSchema } from '@/lib/validators/product-review'
import { eq, avg, count } from 'drizzle-orm'

interface ReviewResponse {
  reviews: {
    id: string
    userId: string
    productId: string
    rating: number
    title: string
    content: string
    images?: string[]
    verifiedPurchase: boolean
    createdAt: Date
    user: {
      name: string
      image: string | null
    }
  }[]
  error?: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: number[]
}

interface ReviewInput {
  productId: string
  rating: number
  title: string
  content: string
  images?: string[]
}

interface ReviewResult {
  review?: {
    id: string
    userId: string
    productId: string
    rating: number
    title: string
    content: string
    images?: string[]
    verifiedPurchase: boolean
    createdAt: Date
  }
  error?: string
}

export async function getProductReviews(
  productId: string
): Promise<ReviewResponse> {
  try {
    const productReviews = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        images: reviews.images,
        verifiedPurchase: reviews.verifiedPurchase,
        createdAt: reviews.createdAt,
        user: {
          name: users.name,
          image: users.image,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(reviews.createdAt)
      .execute()

    return {
      reviews: productReviews.map((review) => ({
        ...review,
        images: review.images ?? undefined,
        verifiedPurchase: review.verifiedPurchase ?? false,
        createdAt: review.createdAt ?? new Date(),
        user: {
          name: review.user?.name ?? 'Anonymous',
          image: review.user?.image ?? null,
        },
      })),
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return { reviews: [], error: 'Failed to fetch reviews' }
  }
}

export async function createProductReview(
  input: ReviewInput
): Promise<ReviewResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'You must be logged in to write a review' }
    }

    // Validate input
    const validatedData = productReviewSchema.parse(input)

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        userId: session.user.id,
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        images: validatedData.images,
        verifiedPurchase: false, // This should be set based on order history
      })
      .returning()

    return {
      review: {
        ...review,
        images: review.images ?? undefined,
        verifiedPurchase: review.verifiedPurchase ?? false,
        createdAt: review.createdAt ?? new Date(),
      },
    }
  } catch (error) {
    console.error('Error creating product review:', error)
    return { error: 'Failed to create review' }
  }
}

export async function getProductReviewStats(
  productId: string
): Promise<ReviewStats> {
  try {
    // First get the average rating and total count
    const statsResult = await db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(),
      })
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .execute()

    // Then get the rating distribution
    const distributionResult = await db
      .select({
        rating: reviews.rating,
        count: count(),
      })
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .groupBy(reviews.rating)
      .execute()

    const stats = statsResult[0] || { averageRating: null, totalReviews: 0 }
    const ratingDistribution = distributionResult.map((r) => r.rating)

    return {
      averageRating: Number(stats.averageRating) || 0,
      totalReviews: Number(stats.totalReviews) || 0,
      ratingDistribution: ratingDistribution || [],
    }
  } catch (error) {
    console.error('Error fetching product review stats:', error)
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [],
    }
  }
}
