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

    // Get sales data for the selected date range
    const salesData = await db
      .select({
        month: sql<string>`to_char(${orders.createdAt}, 'Mon')`,
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`)
      .groupBy(sql`to_char(${orders.createdAt}, 'Mon')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'Mon')`)

    // Get sales by category for the selected date range
    const salesByCategory = await db
      .select({
        category: taxonomy.DEPT,
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .innerJoin(orderItems, sql`${orders.id} = ${orderItems.orderId}`)
      .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
      .innerJoin(taxonomy, sql`${products.department} = ${taxonomy.WEB_TAXONOMY_ID}::text`)
      .where(sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`)
      .groupBy(taxonomy.DEPT)
      .orderBy(sql`SUM(${orders.totalAmount}) DESC`)
      .limit(5)

    // Calculate total sales for percentage calculation
    const totalSales = salesByCategory.reduce((acc, curr) => acc + curr.total, 0)

    // Format the data for the charts
    const formattedSalesData = {
      labels: salesData.map(item => item.month),
      datasets: [
        {
          label: 'Actual Sales',
          data: salesData.map(item => item.total), // Remove cents conversion
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Forecast',
          data: salesData.map(item => item.total * 1.1), // Simple forecast: 10% increase
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
      ],
    }

    const formattedCategoryData = {
      labels: salesByCategory.map(item => item.category || 'Uncategorized'),
      datasets: [
        {
          data: salesByCategory.map(item => (item.total / totalSales) * 100), // Convert to percentages
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1,
        },
      ],
    }

    return NextResponse.json({
      salesData: formattedSalesData,
      categoryData: formattedCategoryData,
    })
  } catch (error) {
    console.error('Error fetching sales forecast data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales forecast data' },
      { status: 500 }
    )
  }
} 