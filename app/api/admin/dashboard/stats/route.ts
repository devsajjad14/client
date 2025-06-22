import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'Date range is required' },
        { status: 400 }
      )
    }

    // Get total users count (not date-dependent)
    const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(users)

    // Get total revenue for the selected date range
    const totalRevenue = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
      })
      .from(orders)
      .where(
        sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`
      )

    // Get total orders for the selected date range
    const totalOrders = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`
      )

    // Get low stock items count for the selected date range
    const lowStockItems = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(
        sql`${products.stockQuantity} <= ${products.lowStockThreshold} AND ${products.createdAt} >= ${fromDate}::timestamp AND ${products.createdAt} <= ${toDate}::timestamp`
      )

    return NextResponse.json({
      totalRevenue: Number(totalRevenue[0].total),
      totalUsers: totalUsers[0].count,
      totalOrders: totalOrders[0].count,
      lowStockItems: lowStockItems[0].count,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 