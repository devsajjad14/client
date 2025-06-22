import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/lib/db/schema'
import { sql, and, gte, lte, eq, or, desc } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    console.log('Fetching product data for timeRange:', timeRange, 'startDate:', startDate, 'endDate:', endDate)

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

    // Get orders in the selected date range
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
    
    console.log('Orders in date range:', ordersInRange)

    // Check all order items regardless of date range first
    const allOrderItems = await db
      .select({
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        productName: products.name
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .limit(5)
      .execute()

    console.log('Sample of all order items:', allOrderItems)

    // Get top performing products
    console.log('Fetching product data...')
    const productData = await db
      .select({
        name: products.name,
        sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
        department: products.department,
        type: products.type,
        subType: products.subType
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(
        and(
          gte(orders.createdAt, startDateObj),
          lte(orders.createdAt, endDateObj)
        )
      )
      .groupBy(products.name, products.department, products.type, products.subType)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.unitPrice})`))
      .limit(10)
      .execute()

    // Convert decimal strings to numbers and format data
    const formattedData = productData.map(product => ({
      name: product.name,
      sales: Number(product.sales) || 0,
      revenue: Number(product.revenue) || 0,
      department: product.department,
      type: product.type,
      subType: product.subType
    }))

    console.log('Product data:', formattedData)
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching product data:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch product data' },
      { status: 500 }
    )
  }
} 