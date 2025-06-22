import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, users } from '@/lib/db/schema'
import { sql, and, eq, desc, count, sum, avg, gte, lte } from 'drizzle-orm'
import { subDays, startOfDay, endOfDay, format, parseISO } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Calculate date ranges
    const endDate = new Date()
    let startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 30)

    // Calculate previous period dates
    const prevEndDate = new Date(startDate)
    let prevStartDate = new Date(prevEndDate)
    prevStartDate.setDate(prevStartDate.getDate() - 30)

    console.log('Date ranges:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timeRange
    })

    // Debug: Show all orders and their users
    const debugOrders = await db
      .select({
        orderId: orders.id,
        userId: orders.userId,
        amount: orders.totalAmount,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))

    console.log('Debug - Orders in period:', debugOrders)

    // Get current period metrics
    const currentMetrics = await db
      .select({
        totalCustomers: sql<number>`(SELECT COUNT(*) FROM ${users})`,
        activeCustomers: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.userId} IS NOT NULL THEN ${orders.userId}::text ELSE ${orders.guestEmail} END)`,
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        totalOrders: sql<number>`count(${orders.id})`,
        repeatCustomers: sql<number>`(SELECT COUNT(*) FROM (SELECT CASE WHEN ${orders.userId} IS NOT NULL THEN ${orders.userId}::text ELSE ${orders.guestEmail} END as customer_id, COUNT(*) as order_count FROM ${orders} WHERE ${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate} GROUP BY customer_id HAVING COUNT(*) > 1) as repeat_users)`,
        totalCustomersWithOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.userId} IS NOT NULL THEN ${orders.userId}::text ELSE ${orders.guestEmail} END)`
      })
      .from(orders)
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))
      .then(rows => {
        console.log('Current metrics row:', rows[0])
        return rows[0]
      })

    // Get previous period metrics for comparison
    const prevMetrics = await db
      .select({
        prevCustomerCount: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.userId} IS NOT NULL THEN ${orders.userId}::text ELSE ${orders.guestEmail} END)`,
        prevAOV: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
        prevRepeatRate: sql<number>`(SELECT COUNT(*) FROM (SELECT CASE WHEN ${orders.userId} IS NOT NULL THEN ${orders.userId}::text ELSE ${orders.guestEmail} END as customer_id, COUNT(*) as order_count FROM ${orders} WHERE ${orders.createdAt} >= ${prevStartDate} AND ${orders.createdAt} <= ${prevEndDate} GROUP BY customer_id HAVING COUNT(*) > 1) as repeat_users)`
      })
      .from(orders)
      .where(and(
        gte(orders.createdAt, prevStartDate),
        lte(orders.createdAt, prevEndDate)
      ))
      .then(rows => {
        console.log('Previous metrics row:', rows[0])
        return rows[0]
      })

    // Calculate final metrics
    const finalMetrics = {
      totalCustomers: currentMetrics.totalCustomers,
      activeCustomers: currentMetrics.activeCustomers,
      averageOrderValue: currentMetrics.totalOrders > 0 ? Number(currentMetrics.totalRevenue) / Number(currentMetrics.totalOrders) : 0,
      repeatPurchaseRate: currentMetrics.totalCustomersWithOrders > 0 ? 
        (Number(currentMetrics.repeatCustomers) / Number(currentMetrics.totalCustomersWithOrders)) * 100 : 0,
      customerChange: prevMetrics.prevCustomerCount ? 
        ((Number(currentMetrics.activeCustomers) - Number(prevMetrics.prevCustomerCount)) / Number(prevMetrics.prevCustomerCount)) * 100 : 0,
      aovChange: prevMetrics.prevAOV ? 
        ((Number(currentMetrics.totalRevenue) / Number(currentMetrics.totalOrders)) - Number(prevMetrics.prevAOV)) / Number(prevMetrics.prevAOV) * 100 : 0,
      repeatRateChange: prevMetrics.prevRepeatRate ? 
        ((Number(currentMetrics.repeatCustomers) / Number(currentMetrics.totalCustomersWithOrders)) * 100) - Number(prevMetrics.prevRepeatRate) : 0
    }

    console.log('Final metrics:', finalMetrics)

    // Get customer data for the chart
    const customerData = await db
      .select({
        date: sql<string>`DATE_TRUNC('day', ${orders.createdAt})::date::text`,
        newCustomers: count(sql`DISTINCT ${users.id}`),
        activeCustomers: count(sql`DISTINCT ${orders.userId}`),
        orders: count(orders.id),
        revenue: sum(orders.totalAmount),
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))
      .groupBy(sql`DATE_TRUNC('day', ${orders.createdAt})`)
      .orderBy(sql`DATE_TRUNC('day', ${orders.createdAt})`)

    // Get top customers
    const topCustomers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        totalOrders: count(orders.id),
        totalSpent: sum(orders.totalAmount),
        lastOrderDate: sql<string>`MAX(${orders.createdAt})::date::text`,
        averageOrderValue: avg(orders.totalAmount),
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))
      .groupBy(users.id, users.name, users.email)
      .orderBy(desc(sql`SUM(${orders.totalAmount})`))
      .limit(5)

    // Get purchase patterns
    const timeOfDayCase = sql`
      CASE 
        WHEN EXTRACT(HOUR FROM ${orders.createdAt}) BETWEEN 6 AND 11 THEN 'Morning (6AM-12PM)'
        WHEN EXTRACT(HOUR FROM ${orders.createdAt}) BETWEEN 12 AND 17 THEN 'Afternoon (12PM-6PM)'
        WHEN EXTRACT(HOUR FROM ${orders.createdAt}) BETWEEN 18 AND 23 THEN 'Evening (6PM-12AM)'
        ELSE 'Night (12AM-6AM)'
      END
    `

    const orderByCase = sql`
      CASE 
        WHEN EXTRACT(HOUR FROM ${orders.createdAt}) BETWEEN 6 AND 11 THEN 1
        WHEN EXTRACT(HOUR FROM ${orders.createdAt}) BETWEEN 12 AND 17 THEN 2
        WHEN EXTRACT(HOUR FROM ${orders.createdAt}) BETWEEN 18 AND 23 THEN 3
        ELSE 4
      END
    `

    const purchasePatterns = await db
      .select({
        timeOfDay: timeOfDayCase,
        orders: count(orders.id),
        revenue: sum(orders.totalAmount),
        averageOrderValue: avg(orders.totalAmount),
      })
      .from(orders)
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))
      .groupBy(timeOfDayCase, orderByCase)
      .orderBy(orderByCase)

    return NextResponse.json({
      metrics: finalMetrics,
      customerData,
      topCustomers,
      purchasePatterns,
    })
  } catch (error) {
    console.error('Error fetching customer insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer insights' },
      { status: 500 }
    )
  }
} 