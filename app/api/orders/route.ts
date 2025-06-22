import { NextResponse } from 'next/server'
import { db, query } from '@/lib/db'
import { orders, orderItems, ordersRelations, users, products } from '@/lib/db/schema'
import { desc, eq, ne, sql, SQL } from 'drizzle-orm'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  guestEmail: string | null
  userId: string | null
  status: string
  paymentMethod: string | null
  paymentStatus: string
  totalAmount: number
  subtotal: number
  tax: number
  discount: number
  shippingFee: number
  note: string | null
  createdAt: Date
  updatedAt: Date | null
  items?: OrderItem[]
}

interface OrderRequest {
  customerEmail: string
  customerName: string
  shippingAddress: string
  paymentMethod: string
  status: string
  note?: string
  items: OrderItem[]
  discountType: string
  discountValue: string
  taxAmount: string
  shippingAmount: string
  userId?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const offset = (page - 1) * limit

    // Build the where clause
    const whereConditions: SQL[] = []
    if (search) {
      whereConditions.push(
        sql`(${orders.guestEmail} ILIKE ${`%${search}%`})`
      )
    }
    if (status) {
      if (status.startsWith('!')) {
        // Handle "not equals" condition
        whereConditions.push(ne(orders.status, status.substring(1)))
      } else {
        whereConditions.push(eq(orders.status, status))
      }
    }
    if (startDate) {
      whereConditions.push(sql`${orders.createdAt} >= ${startDate}`)
    }
    if (endDate) {
      whereConditions.push(sql`${orders.createdAt} <= ${endDate}`)
    }

    // Get total count
    const [{ count }] = await query(async () => {
      return await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
    })

    // Get orders with items
    const ordersList = await query(async () => {
      const ordersResult = await db
        .select()
        .from(orders)
        .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset)

      // Get items for each order
      const ordersWithItems = await Promise.all(
        ordersResult.map(async (order) => {
          const items = await db
            .select({
              id: orderItems.id,
              orderId: orderItems.orderId,
              productId: orderItems.productId,
              name: orderItems.name,
              quantity: orderItems.quantity,
              unitPrice: orderItems.unitPrice,
              totalPrice: orderItems.totalPrice,
              product: {
                id: products.id,
                name: products.name,
                mediumPicture: products.mediumPicture,
                style: products.style,
                styleId: products.styleId,
                brand: products.brand
              }
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id))

          return {
            ...order,
            items
          }
        })
      )

      return ordersWithItems
    })

    return NextResponse.json({
      orders: ordersList,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerEmail,
      shippingAddress,
      billingAddress,
      paymentMethod,
      status,
      note,
      items,
      userId,
      discountType,
      discountValue,
      taxAmount,
      shippingAmount,
      phone,
    } = body

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity) // Remove cents conversion
    }, 0)

    // Calculate total amount including tax and shipping
    const totalAmount = subtotal + 
      (taxAmount ? parseFloat(taxAmount) : 0) +
      (shippingAmount ? parseFloat(shippingAmount) : 0) -
      (discountValue ? parseFloat(discountValue) : 0)

    // Create the order
    const orderData = {
      guestEmail: customerEmail,
      shippingAddress,
      billingAddress,
      paymentMethod,
      status,
      note,
      userId,
      totalAmount,
      subtotal,
      discount: discountValue ? parseFloat(discountValue) : 0,
      tax: taxAmount ? parseFloat(taxAmount) : 0,
      shippingFee: shippingAmount ? parseFloat(shippingAmount) : 0,
    }

    // Insert the order
    const [order] = await query(async () => {
      return await db.insert(orders).values(orderData).returning()
    })

    // Insert order items
    const orderItemsData = items.map((item: any) => ({
      orderId: order.id,
      productId: parseInt(item.productId),
      name: item.productName,
      quantity: item.quantity,
      unitPrice: Math.round(item.price * 100), // Convert to cents
      totalPrice: Math.round(item.price * item.quantity * 100), // Convert to cents
    }))

    await query(async () => {
      await db.insert(orderItems).values(orderItemsData)
    })

    // Update product quantities
    for (const item of items) {
      await query(async () => {
        await db
          .update(products)
          .set({
            quantityAvailable: sql`${products.quantityAvailable} - ${item.quantity}`,
          })
          .where(eq(products.id, parseInt(item.productId)))
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Delete order items first (due to foreign key constraint)
    await db.delete(orderItems).where(eq(orderItems.orderId, id))
    
    // Then delete the order
    await db.delete(orders).where(eq(orders.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning()

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 