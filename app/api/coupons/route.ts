import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/coupons - Get all coupons
export async function GET() {
  try {
    const allCoupons = await db.select().from(coupons)
    return NextResponse.json(allCoupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/coupons - Create a new coupon
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.code || !body.type || !body.value || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert dates to proper format
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)

    // Create new coupon
    const [newCoupon] = await db.insert(coupons).values({
      code: body.code,
      description: body.description,
      type: body.type,
      value: body.value,
      minPurchaseAmount: body.minPurchaseAmount,
      maxDiscountAmount: body.maxDiscountAmount,
      startDate,
      endDate,
      usageLimit: body.usageLimit,
      perCustomerLimit: body.perCustomerLimit,
      isActive: body.isActive ?? true,
      isFirstTimeOnly: body.isFirstTimeOnly ?? false,
      isNewCustomerOnly: body.isNewCustomerOnly ?? false,
      excludedProducts: body.excludedProducts ?? [],
      excludedCategories: body.excludedCategories ?? [],
      includedProducts: body.includedProducts ?? [],
      includedCategories: body.includedCategories ?? [],
      customerGroups: body.customerGroups ?? [],
      createdBy: body.createdBy,
      updatedBy: body.updatedBy,
      metadata: body.metadata ?? {},
      analytics: {
        totalDiscountsGiven: 0,
        totalRevenueImpact: 0,
        averageOrderValue: 0,
        redemptionRate: 0,
        lastUsedAt: null
      }
    }).returning()

    return NextResponse.json(newCoupon)
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

// DELETE /api/coupons - Delete a coupon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    await db.delete(coupons).where(eq(coupons.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
} 