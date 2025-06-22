import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { or, like, eq, sql } from 'drizzle-orm'
import { products } from '@/lib/db/schema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // If search is a number, try to match styleId
    const isNumericSearch = !isNaN(Number(search))
    
    const results = await db.select({
      id: products.id,
      name: products.name,
      sellingPrice: products.sellingPrice,
      regularPrice: products.regularPrice,
      mediumPicture: products.mediumPicture,
      quantityAvailable: products.quantityAvailable,
      style: products.style,
      brand: products.brand,
      styleId: products.styleId,
    })
    .from(products)
    .where(search ? or(
      sql`lower(${products.name}) like ${`%${search.toLowerCase()}%`}`,
      isNumericSearch ? eq(products.styleId, Number(search)) : sql`false`,
      sql`lower(${products.style}) like ${`%${search.toLowerCase()}%`}`
    ) : undefined)
    .orderBy(products.createdAt)
    .limit(10)

    // Transform the data to match the frontend expectations
    const transformedProducts = results.map(product => ({
      id: product.id.toString(),
      name: product.name,
      selling_price: product.sellingPrice,
      regular_price: product.regularPrice,
      image: product.mediumPicture || '/images/site/placeholder.png',
      stock: product.quantityAvailable,
      style: product.style,
      brand: product.brand,
      styleId: product.styleId,
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 