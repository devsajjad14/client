import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxonomy } from '@/lib/db/schema/taxonomy'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const categories = await db.select().from(taxonomy)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.DEPT || !data.WEB_URL) {
      return NextResponse.json(
        { error: 'DEPT and WEB_URL are required' },
        { status: 400 }
      )
    }

    // Check for duplicate WEB_URL
    const existingCategory = await db
      .select()
      .from(taxonomy)
      .where(eq(taxonomy.WEB_URL, data.WEB_URL))
      .limit(1)

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'A category with this URL already exists' },
        { status: 400 }
      )
    }

    // Set default values for optional fields
    const categoryData = {
      ...data,
      TYP: data.TYP || 'EMPTY',
      SUBTYP_1: data.SUBTYP_1 || 'EMPTY',
      SUBTYP_2: data.SUBTYP_2 || 'EMPTY',
      SUBTYP_3: data.SUBTYP_3 || 'EMPTY',
      ACTIVE: data.ACTIVE ?? 1,
      SHORT_DESC: data.SHORT_DESC || '',
      LONG_DESCRIPTION: data.LONG_DESCRIPTION || '',
      META_TAGS: data.META_TAGS || '',
      SITE: 1
    }

    // Insert the new category
    const [newCategory] = await db.insert(taxonomy).values(categoryData).returning()

    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 