import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { refunds } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/refunds/[id] - Get a specific refund
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const refund = await db.query.refunds.findFirst({
      where: eq(refunds.id, params.id),
      with: {
        order: true,
        refundedByUser: true,
      },
    })

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(refund)
  } catch (error) {
    console.error('Error fetching refund:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refund' },
      { status: 500 }
    )
  }
}

// PATCH /api/refunds/[id] - Update a refund
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updatedRefund = await db
      .update(refunds)
      .set(body)
      .where(eq(refunds.id, params.id))
      .returning()

    if (!updatedRefund[0]) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedRefund[0])
  } catch (error) {
    console.error('Error updating refund:', error)
    return NextResponse.json(
      { error: 'Failed to update refund' },
      { status: 500 }
    )
  }
} 