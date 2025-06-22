import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, userProfiles, addresses } from '@/lib/db/schema'
import { eq, ilike, or, and, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        phone: userProfiles.phone,
        billingAddress: sql<string>`COALESCE(
          (
            SELECT json_build_object(
              'street', ${addresses.street},
              'street2', ${addresses.street2},
              'city', ${addresses.city},
              'state', ${addresses.state},
              'postalCode', ${addresses.postalCode},
              'country', ${addresses.country}
            )::text
            FROM ${addresses}
            WHERE ${addresses.userId} = ${users.id}
            AND ${addresses.type} = 'billing'
            AND ${addresses.isDefault} = true
            LIMIT 1
          ),
          '{}'
        )`,
        shippingAddress: sql<string>`COALESCE(
          (
            SELECT json_build_object(
              'street', ${addresses.street},
              'street2', ${addresses.street2},
              'city', ${addresses.city},
              'state', ${addresses.state},
              'postalCode', ${addresses.postalCode},
              'country', ${addresses.country}
            )::text
            FROM ${addresses}
            WHERE ${addresses.userId} = ${users.id}
            AND ${addresses.type} = 'shipping'
            AND ${addresses.isDefault} = true
            LIMIT 1
          ),
          '{}'
        )`
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.id, users.id))
      .where(
        search
          ? or(
              ilike(users.email, `%${search}%`),
              ilike(users.name || '', `%${search}%`),
              ilike(userProfiles.firstName || '', `%${search}%`),
              ilike(userProfiles.lastName || '', `%${search}%`),
              ilike(userProfiles.phone || '', `%${search}%`)
            )
          : undefined
      )

    // Parse the JSON strings into objects
    const parsedUsers = results.map(user => ({
      ...user,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      billingAddress: JSON.parse(user.billingAddress || '{}'),
      shippingAddress: JSON.parse(user.shippingAddress || '{}')
    }))

    return NextResponse.json({ customers: parsedUsers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { firstName, lastName, email, phone, billingAddress, shippingAddress } = data

    // Create user first
    const [user] = await db
      .insert(users)
      .values({
        name: `${firstName} ${lastName}`,
        email,
        emailVerified: null,
        image: null
      })
      .returning()

    // Create user profile
    await db
      .insert(userProfiles)
      .values({
        id: user.id,
        firstName,
        lastName,
        phone
      })

    // Create billing address if provided
    if (billingAddress?.street) {
      await db
        .insert(addresses)
        .values({
          userId: user.id,
          type: 'billing',
          isDefault: true,
          ...billingAddress
        })
    }

    // Create shipping address if provided
    if (shippingAddress?.street) {
      await db
        .insert(addresses)
        .values({
          userId: user.id,
          type: 'shipping',
          isDefault: true,
          ...shippingAddress
        })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
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
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Delete addresses first (due to foreign key constraints)
    await db.delete(addresses).where(eq(addresses.userId, id))
    
    // Delete profile
    await db.delete(userProfiles).where(eq(userProfiles.id, id))
    
    // Delete user
    await db.delete(users).where(eq(users.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
} 