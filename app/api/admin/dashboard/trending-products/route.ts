import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, orderItems } from '@/lib/db/schema'
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

    // Get trending products based on order frequency and total sales for the selected date range
    const trendingProducts = await db
      .select({
        id: products.id,
        name: products.name,
        style: products.style,
        image: products.mediumPicture,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalSales: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .innerJoin(orderItems, sql`${products.id} = ${orderItems.productId}`)
      .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
      .where(sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`)
      .groupBy(products.id, products.name, products.style, products.mediumPicture, products.stockQuantity)
      .orderBy(sql`COUNT(DISTINCT ${orders.id}) DESC`)
      .limit(5)

    // Format the data for display
    const formattedProducts = trendingProducts.map(product => ({
      id: product.id,
      name: product.name,
      style: product.style,
      image: product.image,
      orders: product.totalOrders,
      sales: Number(product.totalSales),
      stock: product.stockQuantity,
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching trending products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending products' },
      { status: 500 }
    )
  }
} 