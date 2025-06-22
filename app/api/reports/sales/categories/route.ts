import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products, taxonomy } from '@/lib/db/schema'
import { sql, and, gte, lte, eq, or, desc } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    console.log('Fetching category data for timeRange:', timeRange, 'startDate:', startDate, 'endDate:', endDate)

    // Calculate date range based on timeRange or custom dates
    const endDateObj = endDate ? new Date(endDate) : new Date()
    const startDateObj = new Date()
    
    if (startDate && endDate) {
      startDateObj.setTime(new Date(startDate).getTime())
    } else {
      if (timeRange === '30d') {
        startDateObj.setDate(startDateObj.getDate() - 30)
      } else if (timeRange === '7d') {
        startDateObj.setDate(startDateObj.getDate() - 7)
      } else if (timeRange === '90d') {
        startDateObj.setDate(startDateObj.getDate() - 90)
      }
    }

    console.log('Date range:', {
      startDate: startDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    })

    // Get category distribution using taxonomy table
    console.log('Fetching category data...')
    
    // First, get total orders for logging
    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .execute()
    
    console.log('Total orders in database:', totalOrders[0].count)

    // Get orders in the selected date range with their status
    const ordersInRange = await db
      .select({
        id: orders.id,
        status: orders.status,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateObj),
          lte(orders.createdAt, endDateObj)
        )
      )
      .execute()

    console.log('Orders in selected date range:', ordersInRange.length)

    // Get category data
    const categoryData = await db
      .select({
        category: sql<string>`COALESCE(${taxonomy.DEPT}, 'Uncategorized')`,
        revenue: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
        orders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        type: sql<string>`COALESCE(${taxonomy.TYP}, 'EMPTY')`
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(taxonomy, sql`${taxonomy.WEB_TAXONOMY_ID} = CAST(${products.department} AS INTEGER)`)
      .where(
        and(
          gte(orders.createdAt, startDateObj),
          lte(orders.createdAt, endDateObj)
        )
      )
      .groupBy(sql`COALESCE(${taxonomy.DEPT}, 'Uncategorized')`, sql`COALESCE(${taxonomy.TYP}, 'EMPTY')`)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.unitPrice})`))
      .execute()

    // Log raw data for debugging
    console.log('Raw category data:', categoryData)

    // Convert decimal strings to numbers and format data
    const formattedData = categoryData.map(category => ({
      category: category.category,
      revenue: Number(category.revenue) || 0,
      orders: Number(category.orders) || 0,
      type: category.type === 'EMPTY' ? null : category.type
    }))

    console.log('Category data:', formattedData)
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching category data:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch category data' },
      { status: 500 }
    )
  }
} 