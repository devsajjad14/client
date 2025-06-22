import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { addresses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let userAddresses
    if (type) {
      userAddresses = await db
        .select()
        .from(addresses)
        .where(
          and(eq(addresses.userId, session.user.id), eq(addresses.type, type))
        )
        .orderBy(addresses.isDefault)
    } else {
      userAddresses = await db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, session.user.id))
        .orderBy(addresses.isDefault)
    }

    return NextResponse.json(userAddresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    if (
      !data.type ||
      !data.street ||
      !data.city ||
      !data.state ||
      !data.postalCode ||
      !data.country
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If this is set as default, unset any other default address of the same type
    if (data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, session.user.id),
            eq(addresses.type, data.type)
          )
        )
    }

    // Create new address
    const [newAddress] = await db
      .insert(addresses)
      .values({
        userId: session.user.id,
        type: data.type,
        street: data.street,
        street2: data.street2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault || false,
      })
      .returning()

    return NextResponse.json(newAddress)
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
