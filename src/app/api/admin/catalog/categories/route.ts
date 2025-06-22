import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxonomy } from '@/lib/db/schema'

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
        { error: 'Department and URL Handle are required' },
        { status: 400 }
      )
    }

    // Insert the new category
    const [newCategory] = await db.insert(taxonomy).values({
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
      ACTIVE: data.ACTIVE || 1,
      BACKGROUNDIMAGE: data.BACKGROUNDIMAGE,
      SHORT_DESC_ON_PAGE: data.SHORT_DESC_ON_PAGE,
      GOOGLEPRODUCTTAXONOMY: data.GOOGLEPRODUCTTAXONOMY,
      SITE: data.SITE || 1,
      CATEGORYTEMPLATE: data.CATEGORYTEMPLATE,
      BESTSELLERBG: data.BESTSELLERBG,
      NEWARRIVALBG: data.NEWARRIVALBG,
      PAGEBGCOLOR: data.PAGEBGCOLOR,
    }).returning()

    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 