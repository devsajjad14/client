import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, taxonomy, orderItems } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'Date range parameters are required' },
        { status: 400 }
      )
    }

    // First get total sales for percentage calculation within the date range
    const totalSalesResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`)

    const totalSales = totalSalesResult[0].total

    // Get top categories based on sales in the selected date range
    const topCategories = await db
      .select({
        name: taxonomy.DEPT,
        totalSales: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
      })
      .from(orders)
      .innerJoin(orderItems, sql`${orders.id} = ${orderItems.orderId}`)
      .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
      .innerJoin(taxonomy, sql`${products.department} = ${taxonomy.WEB_TAXONOMY_ID}::text`)
      .where(sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`)
      .groupBy(taxonomy.DEPT)
      .orderBy(sql`SUM(${orders.totalAmount}) DESC`)
      .limit(4)

    console.log('Total sales:', totalSales)
    console.log('Raw category data:', topCategories)

    // Format the data for display
    const formattedCategories = topCategories.map((category, index) => {
      const percentage = totalSales > 0 ? (Number(category.totalSales) / totalSales) * 100 : 0
      console.log(`Category ${category.name}:`, {
        totalSales: category.totalSales,
        percentage,
        formattedPercentage: percentage.toFixed(1)
      })

      return {
        name: category.name || 'Uncategorized',
        value: parseFloat(percentage.toFixed(1)),
        color: [
          'bg-blue-500',
          'bg-purple-500',
          'bg-green-500',
          'bg-yellow-500',
        ][index],
        orderCount: category.orderCount,
        totalSales: Number(category.totalSales),
      }
    })

    console.log('Formatted categories:', formattedCategories)

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching top categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top categories' },
      { status: 500 }
    )
  }
} 