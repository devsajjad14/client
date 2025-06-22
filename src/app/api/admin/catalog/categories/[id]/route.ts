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
    
    // Validate required fields
    if (!data.DEPT || !data.WEB_URL) {
      return NextResponse.json(
        { error: 'Department and URL are required' },
        { status: 400 }
      )
    }

    // Update the category
    const [updatedCategory] = await db
      .update(taxonomy)
      .set({
        DEPT: data.DEPT,
        TYP: data.TYP || 'EMPTY',
        SUBTYP_1: data.SUBTYP_1 || 'EMPTY',
        SUBTYP_2: data.SUBTYP_2 || 'EMPTY',
        SUBTYP_3: data.SUBTYP_3 || 'EMPTY',
        SORT_POSITION: data.SORT_POSITION,
        WEB_URL: data.WEB_URL,
        LONG_DESCRIPTION: data.LONG_DESCRIPTION,
        CATEGORY_STYLE: data.CATEGORY_STYLE,
        SHORT_DESC: data.SHORT_DESC,
        LONG_DESCRIPTION_2: data.LONG_DESCRIPTION_2,
        META_TAGS: data.META_TAGS,
        ACTIVE: data.ACTIVE ?? 1,
        BACKGROUNDIMAGE: data.BACKGROUNDIMAGE,
        SHORT_DESC_ON_PAGE: data.SHORT_DESC_ON_PAGE,
        GOOGLEPRODUCTTAXONOMY: data.GOOGLEPRODUCTTAXONOMY,
        SITE: data.SITE ?? 1,
        CATEGORYTEMPLATE: data.CATEGORYTEMPLATE,
        BESTSELLERBG: data.BESTSELLERBG,
        NEWARRIVALBG: data.NEWARRIVALBG,
        PAGEBGCOLOR: data.PAGEBGCOLOR,
      })
      .where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(params.id)))
      .returning()

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCategory)
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
    const [deletedCategory] = await db
      .delete(taxonomy)
      .where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(params.id)))
      .returning()

    if (!deletedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deletedCategory)
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 