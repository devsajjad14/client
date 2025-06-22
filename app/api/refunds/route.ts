import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { refunds, orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/refunds - Get all refunds
export async function GET() {
  try {
    const allRefunds = await db.query.refunds.findMany({
      with: {
        order: true,
        refundedByUser: true,
      },
      orderBy: (refunds, { desc }) => [desc(refunds.createdAt)],
    })

    return NextResponse.json(allRefunds)
  } catch (error) {
    console.error('Error fetching refunds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refunds' },
      { status: 500 }
    )
  }
}

// POST /api/refunds - Create a new refund
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      orderId,
      amount,
      reason,
      refundMethod,
      refundType,
      notes,
      refundPolicy,
      refundItems,
      payment_status,
      refundStatusHistory
    } = body

    // Create the refund with the amount as is (no conversion needed)
    const refundData = {
      orderId,
      amount: parseFloat(amount), // Keep as decimal
      reason,
      refundMethod,
      refundType,
      notes,
      refundPolicy,
      payment_status,
      refundStatusHistory
    }

    // Create the refund first
    const [newRefund] = await db
      .insert(refunds)
      .values({
        ...refundData,
        orderId,
        refundType,
      })
      .returning()

    // Then update the order status
    await db
      .update(orders)
      .set({
        status: refundType === 'full' ? 'full_refunded' : 'partial_refunded',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    return NextResponse.json(newRefund)
  } catch (error) {
    console.error('Error creating refund:', error)
    return NextResponse.json(
      { error: 'Failed to create refund' },
      { status: 500 }
    )
  }
}

// DELETE /api/refunds?id=123 - Delete a refund
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Refund ID is required' },
        { status: 400 }
      )
    }

    await db.delete(refunds).where(eq(refunds.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting refund:', error)
    return NextResponse.json(
      { error: 'Failed to delete refund' },
      { status: 500 }
    )
  }
} 