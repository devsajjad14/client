import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, userProfiles, adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// GET all admin users
export async function GET() {
  try {
    const allUsers = await db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      image: adminUsers.profileImage,
      profile: {
        phone: adminUsers.phoneNumber,
      },
      role: adminUsers.role,
      status: adminUsers.status,
      address: adminUsers.address,
    })
    .from(adminUsers)
    .where(eq(adminUsers.status, 'active'))

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST new admin user
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string
    const address = formData.get('address') as string
    const image = formData.get('image') as string | null

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const [adminUser] = await db.insert(adminUsers).values({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      status,
      address,
      profileImage: image,
      phoneNumber,
    }).returning()

    // Return the complete user data
    const [completeUser] = await db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      image: adminUsers.profileImage,
      profile: {
        phone: adminUsers.phoneNumber,
      },
      role: adminUsers.role,
      status: adminUsers.status,
      address: adminUsers.address,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, adminUser.id))

    return NextResponse.json(completeUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT update admin user
export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string
    const address = formData.get('address') as string
    const image = formData.get('image') as string | null

    // Update admin user
    await db
      .update(adminUsers)
      .set({
        name,
        email,
        role,
        status,
        address,
        ...(image && { profileImage: image }),
        phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id))

    // Get the complete updated user data
    const [updatedUser] = await db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      image: adminUsers.profileImage,
      profile: {
        phone: adminUsers.phoneNumber,
      },
      role: adminUsers.role,
      status: adminUsers.status,
      address: adminUsers.address,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE admin user (hard delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('DELETE request received for user ID:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists before deleting
    const existingUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))

    console.log('User found before delete:', existingUser.length > 0)

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hard delete by removing the user from adminUsers table
    const deleteResult = await db
      .delete(adminUsers)
      .where(eq(adminUsers.id, id))
      .returning()

    console.log('Delete result:', deleteResult)

    // Verify the user was actually deleted
    const userAfterDelete = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))

    console.log('User found after delete:', userAfterDelete.length > 0)

    if (userAfterDelete.length > 0) {
      console.error('User still exists after delete operation')
      return NextResponse.json(
        { error: 'Failed to delete user - user still exists in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, deletedUser: deleteResult[0] })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 