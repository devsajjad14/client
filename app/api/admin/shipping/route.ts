import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shippingMethods } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const methods = await db.query.shippingMethods.findMany({
      orderBy: (methods, { desc }) => [desc(methods.createdAt)],
    })
    return NextResponse.json(methods)
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, estimatedDays, isActive } = await request.json()

    if (!name || !price || !estimatedDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newMethod = await db.insert(shippingMethods).values({
      name,
      description,
      price,
      estimatedDays,
      isActive,
    }).returning()

    return NextResponse.json(newMethod[0])
  } catch (error) {
    console.error('Error creating shipping method:', error)
    return NextResponse.json(
      { error: 'Failed to create shipping method' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, price, estimatedDays, isActive } = await request.json()

    if (!id || !name || !price || !estimatedDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updatedMethod = await db
      .update(shippingMethods)
      .set({
        name,
        description,
        price,
        estimatedDays,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(shippingMethods.id, id))
      .returning()

    if (!updatedMethod.length) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedMethod[0])
  } catch (error) {
    console.error('Error updating shipping method:', error)
    return NextResponse.json(
      { error: 'Failed to update shipping method' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Shipping method ID is required' },
        { status: 400 }
      )
    }

    const deletedMethod = await db
      .delete(shippingMethods)
      .where(eq(shippingMethods.id, id))
      .returning()

    if (!deletedMethod.length) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedMethod[0])
  } catch (error) {
    console.error('Error deleting shipping method:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipping method' },
      { status: 500 }
    )
  }
} 