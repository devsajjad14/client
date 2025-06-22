import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { refunds } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// PATCH /api/refunds/[id]/status - Update refund status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, note } = body

    const refund = await db.query.refunds.findFirst({
      where: eq(refunds.id, params.id),
    })

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      )
    }

    // Add status to history
    const statusHistory = refund.refundStatusHistory || []
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || '',
      updatedBy: 'system', // TODO: Add actual user ID
    })

    const updatedRefund = await db
      .update(refunds)
      .set({
        payment_status: status,
        refundStatusHistory: statusHistory,
        updatedAt: new Date(),
      })
      .where(eq(refunds.id, params.id))
      .returning()

    return NextResponse.json(updatedRefund[0])
  } catch (error) {
    console.error('Error updating refund status:', error)
    return NextResponse.json(
      { error: 'Failed to update refund status' },
      { status: 500 }
    )
  }
} 