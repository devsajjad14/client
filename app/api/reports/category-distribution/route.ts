import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, taxonomy, orderItems } from '@/lib/db/schema'
import { and, eq, gte, lte, or, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    console.log('Fetching category distribution for timeRange:', timeRange, 'startDate:', startDate, 'endDate:', endDate)

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

    // First get all categories
    const allCategories = await db
      .select({
        id: taxonomy.WEB_TAXONOMY_ID,
        dept: taxonomy.DEPT,
        typ: taxonomy.TYP,
      })
      .from(taxonomy)
      .orderBy(taxonomy.DEPT)

    console.log('All categories:', allCategories)

    // Then get sales data for these categories
    const salesData = await db
      .select({
        categoryId: products.department,
        revenue: sql<number>`COALESCE(SUM(${orderItems.totalPrice}), 0)`,
        orders: sql<number>`COUNT(DISTINCT ${orders.id})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          gte(orders.createdAt, startDateObj),
          lte(orders.createdAt, endDateObj),
          or(
            eq(orders.status, 'delivered'),
            eq(orders.status, 'paid')
          )
        )
      )
      .groupBy(products.department)

    console.log('Sales data:', salesData)

    // Combine categories with sales data
    const categoryData = allCategories.map(category => {
      const sales = salesData.find(s => s.categoryId === category.id.toString())
      return {
        category: category.dept,
        revenue: sales?.revenue || 0,
        orders: sales?.orders || 0,
        type: category.typ === 'EMPTY' ? null : category.typ
      }
    })

    // Sort by revenue
    categoryData.sort((a, b) => b.revenue - a.revenue)

    console.log('Combined category data:', categoryData)
    return NextResponse.json(categoryData)
  } catch (error) {
    console.error('Error fetching category distribution:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch category distribution' },
      { status: 500 }
    )
  }
} 