import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiIntegrations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid integration ID' },
        { status: 400 }
      )
    }

    const [integration] = await db
      .select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, id))

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Error fetching integration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid integration ID' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    // Remove any date fields from the incoming data
    const { createdAt, updatedAt, ...updateData } = data

    const [integration] = await db
      .update(apiIntegrations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(apiIntegrations.id, id))
      .returning()

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    )
  }
} 