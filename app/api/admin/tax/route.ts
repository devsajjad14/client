import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxRates } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rates = await db.query.taxRates.findMany({
      orderBy: (rates, { desc }) => [desc(rates.createdAt)],
    })
    return NextResponse.json(rates)
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax rates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, rate, country, state, zipCode, isActive, priority } = await request.json()

    if (!name || !rate || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newRate = await db.insert(taxRates).values({
      name,
      rate,
      country,
      state,
      zipCode,
      isActive,
      priority,
    }).returning()

    return NextResponse.json(newRate[0])
  } catch (error) {
    console.error('Error creating tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to create tax rate' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, rate, country, state, zipCode, isActive, priority } = await request.json()

    if (!id || !name || !rate || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updatedRate = await db
      .update(taxRates)
      .set({
        name,
        rate,
        country,
        state,
        zipCode,
        isActive,
        priority,
        updatedAt: new Date(),
      })
      .where(eq(taxRates.id, id))
      .returning()

    if (!updatedRate.length) {
      return NextResponse.json(
        { error: 'Tax rate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedRate[0])
  } catch (error) {
    console.error('Error updating tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to update tax rate' },
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
        { error: 'Tax rate ID is required' },
        { status: 400 }
      )
    }

    const deletedRate = await db
      .delete(taxRates)
      .where(eq(taxRates.id, id))
      .returning()

    if (!deletedRate.length) {
      return NextResponse.json(
        { error: 'Tax rate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedRate[0])
  } catch (error) {
    console.error('Error deleting tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to delete tax rate' },
      { status: 500 }
    )
  }
} 