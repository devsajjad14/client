import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, userProfiles, addresses } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const [user] = await db
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
      .where(eq(users.id, resolvedParams.id))

    if (!user) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const responseData = {
      ...user,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      billingAddress: JSON.parse(user.billingAddress || '{}'),
      shippingAddress: JSON.parse(user.shippingAddress || '{}')
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const { firstName, lastName, email, phone, billingAddress, shippingAddress } = data

    // Update user
    if (email || (firstName && lastName)) {
      await db
        .update(users)
        .set({
          name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
          email: email,
        })
        .where(eq(users.id, resolvedParams.id))
    }

    // Update profile
    if (firstName || lastName || phone) {
      await db
        .update(userProfiles)
        .set({
          firstName: firstName,
          lastName: lastName,
          phone: phone,
        })
        .where(eq(userProfiles.id, resolvedParams.id))
    }

    // Update billing address
    if (billingAddress) {
      // Delete existing default billing address
      await db
        .delete(addresses)
        .where(
          and(
            eq(addresses.userId, resolvedParams.id),
            eq(addresses.type, 'billing'),
            eq(addresses.isDefault, true)
          )
        )

      // Create new billing address
      if (billingAddress.street) {
        await db
          .insert(addresses)
          .values({
            userId: resolvedParams.id,
            type: 'billing',
            isDefault: true,
            ...billingAddress,
          })
      }
    }

    // Update shipping address
    if (shippingAddress) {
      // Delete existing default shipping address
      await db
        .delete(addresses)
        .where(
          and(
            eq(addresses.userId, resolvedParams.id),
            eq(addresses.type, 'shipping'),
            eq(addresses.isDefault, true)
          )
        )

      // Create new shipping address
      if (shippingAddress.street) {
        await db
          .insert(addresses)
          .values({
            userId: resolvedParams.id,
            type: 'shipping',
            isDefault: true,
            ...shippingAddress,
          })
      }
    }

    return NextResponse.json({ success: true, id: resolvedParams.id })
  } catch (error) {
    console.error('Error updating customer:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update customer'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 