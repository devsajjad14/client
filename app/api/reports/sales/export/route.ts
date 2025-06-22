import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date range based on timeRange
    const endDate = new Date()
    const startDate = new Date()
    if (timeRange === '30d') {
      startDate.setDate(startDate.getDate() - 30)
    } else if (timeRange === '7d') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeRange === '90d') {
      startDate.setDate(startDate.getDate() - 90)
    }

    // Get sales data for export
    const salesData = await db.select({
      date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
      orderId: orders.id,
      productName: products.name,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      category: products.department,
      status: orders.status,
    })
    .from(orderItems)
    .innerJoin(orders, sql`${orders.id} = ${orderItems.orderId}`)
    .innerJoin(products, sql`${products.id} = ${orderItems.productId}`)
    .where(sql`
      ${orders.createdAt} >= ${startDate}
      AND ${orders.createdAt} <= ${endDate}
    `)
    .orderBy(orders.createdAt)

    // Convert to CSV
    const headers = [
      'Date',
      'Order ID',
      'Product Name',
      'Quantity',
      'Unit Price',
      'Total Price',
      'Category',
      'Status',
    ]

    const csvRows = [
      headers.join(','),
      ...salesData.map(row => [
        row.date,
        row.orderId,
        `"${row.productName.replace(/"/g, '""')}"`,
        row.quantity,
        row.unitPrice,
        row.totalPrice,
        `"${row.category?.replace(/"/g, '""') || ''}"`,
        row.status,
      ].join(','))
    ]

    const csv = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting sales data:', error)
    return NextResponse.json(
      { error: 'Failed to export sales data' },
      { status: 500 }
    )
  }
} 