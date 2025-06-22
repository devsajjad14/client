import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { desc, sql } from 'drizzle-orm'

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

    // Fetch the 5 most recent orders within the date range
    const recentOrders = await db
      .select({
        id: orders.id,
        customer: orders.guestEmail,
        date: orders.createdAt,
        amount: orders.totalAmount,
        status: orders.status,
        payment: orders.paymentMethod,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${fromDate}::timestamp AND ${orders.createdAt} <= ${toDate}::timestamp`)
      .orderBy(desc(orders.createdAt))
      .limit(5)

    // Format the data to match the UI requirements
    const formattedOrders = recentOrders.map(order => ({
      id: `#ORD-${order.id}`,
      customer: order.customer || 'Guest',
      date: order.date?.toISOString() || new Date().toISOString(),
      amount: Number(order.amount),
      status: order.status.toLowerCase(),
      payment: order.payment?.toLowerCase() || 'unknown',
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    )
  }
} 