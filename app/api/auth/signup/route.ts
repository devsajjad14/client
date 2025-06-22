import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, addresses } from '@/lib/db/schema'

export async function POST(request: Request) {
  try {
    const { name, email, password, billingAddress } = await request.json()

    if (!name || !email || !password || !billingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email.toLowerCase()),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password,
      })
      .returning()

    // Add billing address
    await db.insert(addresses).values({
      userId: newUser.id,
      type: 'billing',
      ...billingAddress,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
