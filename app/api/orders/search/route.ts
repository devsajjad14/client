import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { desc, or, like } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const data = await db.query.orders.findMany({
      where: or(
        like(orders.guestEmail || '', `%${query}%`),
        like(orders.id, `%${query}%`)
      ),
      orderBy: [desc(orders.createdAt)],
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching orders:', error)
    return NextResponse.json({ error: 'Failed to search orders' }, { status: 500 })
  }
} 