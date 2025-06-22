import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxonomy } from '@/lib/db/schema/taxonomy'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db
      .select()
      .from(taxonomy)
      .where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(params.id)))
      .limit(1)

    if (!category.length) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category[0])
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Update the category
    const result = await db
      .update(taxonomy)
      .set({
        DEPT: data.DEPT,
        TYP: data.TYP,
        SUBTYP_1: data.SUBTYP_1,
        SUBTYP_2: data.SUBTYP_2,
        SUBTYP_3: data.SUBTYP_3,
        WEB_URL: data.WEB_URL,
        ACTIVE: data.ACTIVE,
        SHORT_DESC: data.SHORT_DESC,
        LONG_DESCRIPTION: data.LONG_DESCRIPTION,
        META_TAGS: data.META_TAGS,
        SORT_POSITION: data.SORT_POSITION,
      })
      .where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(params.id)))
      .returning()

    if (!result.length) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db
      .delete(taxonomy)
      .where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(params.id)))
      .returning()

    if (!result.length) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 