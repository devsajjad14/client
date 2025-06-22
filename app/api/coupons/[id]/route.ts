import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/coupons/[id] - Get a specific coupon
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, params.id))

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

// PATCH /api/coupons/[id] - Update a coupon
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Check if coupon exists
    const [existingCoupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, params.id))

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    // Only update fields that are provided
    if (body.code !== undefined) updateData.code = body.code
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.value !== undefined) updateData.value = body.value
    if (body.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = body.minPurchaseAmount
    if (body.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = body.maxDiscountAmount
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit
    if (body.perCustomerLimit !== undefined) updateData.perCustomerLimit = body.perCustomerLimit
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isFirstTimeOnly !== undefined) updateData.isFirstTimeOnly = body.isFirstTimeOnly
    if (body.isNewCustomerOnly !== undefined) updateData.isNewCustomerOnly = body.isNewCustomerOnly
    if (body.excludedProducts !== undefined) updateData.excludedProducts = body.excludedProducts
    if (body.excludedCategories !== undefined) updateData.excludedCategories = body.excludedCategories
    if (body.includedProducts !== undefined) updateData.includedProducts = body.includedProducts
    if (body.includedCategories !== undefined) updateData.includedCategories = body.includedCategories
    if (body.customerGroups !== undefined) updateData.customerGroups = body.customerGroups
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.analytics !== undefined) updateData.analytics = body.analytics
    if (body.updatedBy !== undefined) updateData.updatedBy = body.updatedBy

    // Update the coupon
    const [updatedCoupon] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, params.id))
      .returning()

    return NextResponse.json(updatedCoupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
} 