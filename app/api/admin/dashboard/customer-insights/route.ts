import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Get total customers
    const totalCustomers = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(users)

    // Get new customers in last 30 days
    const newCustomers = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(sql`${users.id} IN (
        SELECT id FROM users 
        WHERE "created_at" >= NOW() - INTERVAL '30 days'
      )`)

    // Get returning customers (customers with multiple orders)
    const returningCustomers = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${users.id})`,
      })
      .from(users)
      .where(sql`EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.userId = ${users.id} 
        GROUP BY orders.userId 
        HAVING COUNT(*) > 1
      )`)

    // Get inactive customers (no orders in last 90 days)
    const inactiveCustomers = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${users.id})`,
      })
      .from(users)
      .where(sql`NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.userId = ${users.id} 
        AND orders.createdAt >= NOW() - INTERVAL '90 days'
      )`)

    // Calculate percentages
    const total = totalCustomers[0].count
    const newPercentage = (newCustomers[0].count / total) * 100
    const returningPercentage = (returningCustomers[0].count / total) * 100
    const inactivePercentage = (inactiveCustomers[0].count / total) * 100
    const loyalPercentage = 100 - (newPercentage + returningPercentage + inactivePercentage)

    // Get overall rating (placeholder - you might want to implement this based on your actual review data)
    const overallRating = 4.8
    const positiveReviews = 92
    const responseRate = 98

    return NextResponse.json({
      segments: {
        new: newPercentage,
        returning: returningPercentage,
        loyal: loyalPercentage,
        inactive: inactivePercentage,
      },
      metrics: {
        overallRating,
        positiveReviews,
        responseRate,
      },
    })
  } catch (error) {
    console.error('Error fetching customer insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer insights' },
      { status: 500 }
    )
  }
} 