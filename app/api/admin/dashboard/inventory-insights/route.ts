import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Get low stock items (below threshold)
    const lowStockItems = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(products)
      .where(sql`${products.stockQuantity} <= ${products.lowStockThreshold} AND ${products.stockQuantity} > 0`)

    // Get out of stock items
    const outOfStockItems = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(products)
      .where(sql`${products.stockQuantity} = 0`)

    // Get top selling products with stock
    const topSellingProducts = await db
      .select({
        name: products.name,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .where(sql`${products.stockQuantity} > 0`)
      .orderBy(products.stockQuantity)
      .limit(3)

    // Calculate total inventory value
    const inventoryValue = await db
      .select({
        total: sql<number>`COALESCE(SUM(${products.stockQuantity} * ${products.sellingPrice}), 0)`,
      })
      .from(products)

    // Get recent restocks (products with stock changes in last 7 days)
    const recentRestocks = await db
      .select({
        name: products.name,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .where(sql`${products.updatedAt} >= NOW() - INTERVAL '7 days'`)
      .orderBy(products.updatedAt)
      .limit(3)

    // Calculate return rate (placeholder - you might want to implement this based on your actual return data)
    const returnRate = 2.4 // This should be calculated from actual return data

    return NextResponse.json({
      lowStockItems: lowStockItems[0].count,
      outOfStockItems: outOfStockItems[0].count,
      topSellingProducts: topSellingProducts.map(p => ({
        name: p.name,
        stock: p.stockQuantity,
      })),
      inventoryValue: inventoryValue[0].total,
      recentRestocks: recentRestocks.map(p => ({
        name: p.name,
        stock: p.stockQuantity,
      })),
      returnRate,
    })
  } catch (error) {
    console.error('Error fetching inventory insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory insights' },
      { status: 500 }
    )
  }
} 