import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { sql, and, gte, lte } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    console.log('Fetching trend data for timeRange:', timeRange, 'startDate:', startDate, 'endDate:', endDate)

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

    try {
      // First, let's check if we have any orders in the table
      const orderCount = await db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(orders)
      console.log('Total orders in database:', orderCount[0].count)

      // Check orders within our date range
      const ordersInRange = await db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateObj),
          lte(orders.createdAt, endDateObj)
        )
      )
      console.log('Orders in selected date range:', ordersInRange[0].count)

      // Get daily sales data with moving averages
      console.log('Fetching sales data...')
      const salesData = await db.select({
        date: sql<string>`DATE(${orders.createdAt})::text`,
        revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        orders: sql<number>`COUNT(*)`,
        customers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        revenueMA: sql<number>`COALESCE(
          AVG(SUM(${orders.totalAmount})) OVER (
            ORDER BY DATE(${orders.createdAt})
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
          ), 0
        )`,
        ordersMA: sql<number>`COALESCE(
          AVG(COUNT(*)) OVER (
            ORDER BY DATE(${orders.createdAt})
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
          ), 0
        )`,
        customersMA: sql<number>`COALESCE(
          AVG(COUNT(DISTINCT ${orders.userId})) OVER (
            ORDER BY DATE(${orders.createdAt})
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
          ), 0
        )`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateObj),
          lte(orders.createdAt, endDateObj)
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`)

      console.log('Raw sales data from database:', salesData)

      // Generate all dates in the range to fill gaps
      const allDates = []
      const currentDate = new Date(startDateObj)
      while (currentDate <= endDateObj) {
        allDates.push(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Fill gaps in data with zeros
      const filledData = allDates.map(date => {
        const existingData = salesData.find(d => d.date === date)
        return existingData ? {
          ...existingData,
          revenue: Number(existingData.revenue) || 0,
          revenueMA: Number(existingData.revenueMA) || 0,
          orders: Number(existingData.orders) || 0,
          ordersMA: Number(existingData.ordersMA) || 0,
          customers: Number(existingData.customers) || 0,
          customersMA: Number(existingData.customersMA) || 0
        } : {
          date,
          revenue: 0,
          orders: 0,
          customers: 0,
          revenueMA: 0,
          ordersMA: 0,
          customersMA: 0
        }
      })

      // Log some sample data points
      if (filledData.length > 0) {
        console.log('Sample data points:', {
          first: filledData[0],
          last: filledData[filledData.length - 1],
          totalDays: filledData.length,
          nonZeroDays: filledData.filter(d => d.revenue > 0 || d.orders > 0).length
        })
      }

      return NextResponse.json(filledData)
    } catch (dbError) {
      console.error('Database error:', dbError)
      if (dbError instanceof Error) {
        console.error('Database error details:', {
          message: dbError.message,
          stack: dbError.stack
        })
      }
      throw dbError
    }
  } catch (error) {
    console.error('Error fetching sales trend:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch sales trend', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 