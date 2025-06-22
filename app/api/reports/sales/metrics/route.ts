import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, users } from '@/lib/db/schema'
import { and, eq, desc, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    console.log('Fetching metrics for timeRange:', timeRange, 'startDate:', startDate, 'endDate:', endDate)

    // Calculate date ranges
    const now = new Date()
    const currentPeriodStart = new Date()
    const previousPeriodStart = new Date()

    if (startDate && endDate) {
      // Custom date range
      currentPeriodStart.setTime(new Date(startDate).getTime())
      const periodDuration = new Date(endDate).getTime() - currentPeriodStart.getTime()
      previousPeriodStart.setTime(currentPeriodStart.getTime() - periodDuration)
    } else {
      // Preset ranges
      switch (timeRange) {
        case '7d':
          currentPeriodStart.setDate(now.getDate() - 7)
          previousPeriodStart.setDate(now.getDate() - 14)
          break
        case '90d':
          currentPeriodStart.setDate(now.getDate() - 90)
          previousPeriodStart.setDate(now.getDate() - 180)
          break
        default: // 30d
          currentPeriodStart.setDate(now.getDate() - 30)
          previousPeriodStart.setDate(now.getDate() - 60)
      }
    }

    const currentPeriodEnd = startDate && endDate ? new Date(endDate) : now

    console.log('Date ranges:', {
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      previousPeriodStart: previousPeriodStart.toISOString(),
      now: now.toISOString()
    })

    // Get current period metrics
    console.log('Fetching current period metrics...')
    const currentPeriodMetrics = await db.select({
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
      totalOrders: sql<number>`COUNT(*)`,
      totalCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${currentPeriodStart} AND ${orders.createdAt} <= ${currentPeriodEnd}`)

    // Get previous period metrics
    console.log('Fetching previous period metrics...')
    const previousPeriodMetrics = await db.select({
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
      totalOrders: sql<number>`COUNT(*)`,
      totalCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${previousPeriodStart} AND ${orders.createdAt} < ${currentPeriodStart}`)

    // Get total customer count
    const totalCustomers = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(users)

    // Calculate metrics
    const current = {
      totalRevenue: Number(currentPeriodMetrics[0].totalRevenue) || 0,
      totalOrders: currentPeriodMetrics[0].totalOrders || 0,
      totalCustomers: currentPeriodMetrics[0].totalCustomers || 0
    }

    const previous = {
      totalRevenue: Number(previousPeriodMetrics[0].totalRevenue) || 0,
      totalOrders: previousPeriodMetrics[0].totalOrders || 0,
      totalCustomers: previousPeriodMetrics[0].totalCustomers || 0
    }

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0
      }
      const change = ((current - previous) / previous) * 100
      return Number.isFinite(change) ? change : 0
    }

    const revenueChange = calculatePercentageChange(current.totalRevenue, previous.totalRevenue)
    const ordersChange = calculatePercentageChange(current.totalOrders, previous.totalOrders)
    const avgOrderValue = current.totalOrders > 0 
      ? current.totalRevenue / current.totalOrders
      : 0
    const prevAvgOrderValue = previous.totalOrders > 0 
      ? previous.totalRevenue / previous.totalOrders
      : 0
    const avgOrderValueChange = calculatePercentageChange(avgOrderValue, prevAvgOrderValue)
    const customersChange = calculatePercentageChange(current.totalCustomers, previous.totalCustomers)

    const response = {
      totalRevenue: Number(current.totalRevenue.toFixed(2)),
      totalOrders: current.totalOrders,
      averageOrderValue: Number(avgOrderValue.toFixed(2)),
      totalCustomers: totalCustomers[0].count,
      revenueChange: Number(revenueChange.toFixed(1)),
      ordersChange: Number(ordersChange.toFixed(1)),
      aovChange: Number(avgOrderValueChange.toFixed(1)),
      customersChange: Number(customersChange.toFixed(1)),
      debug: {
        currentPeriodMetrics: {
          ...current,
          totalRevenue: Number(current.totalRevenue.toFixed(2))
        },
        previousPeriodMetrics: {
          ...previous,
          totalRevenue: Number(previous.totalRevenue.toFixed(2))
        },
        totalCustomers: totalCustomers[0].count
      }
    }

    console.log('Final response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch sales metrics:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch sales metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 