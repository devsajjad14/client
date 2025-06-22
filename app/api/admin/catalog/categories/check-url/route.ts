import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxonomy } from '@/lib/db/schema/taxonomy'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const webUrl = searchParams.get('webUrl')

    if (!webUrl) {
      return NextResponse.json(
        { error: 'Web URL is required' },
        { status: 400 }
      )
    }

    // Check if the web URL already exists
    const existingCategory = await db
      .select()
      .from(taxonomy)
      .where(eq(taxonomy.WEB_URL, webUrl))
      .limit(1)

    const exists = existingCategory.length > 0

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Error checking web URL:', error)
    return NextResponse.json(
      { error: 'Failed to check web URL' },
      { status: 500 }
    )
  }
} 