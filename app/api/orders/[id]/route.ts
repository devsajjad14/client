import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, users, userProfiles, addresses, products } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const orderId = resolvedParams.id

    // Get the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get the order items with product information
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
      .where(eq(orderItems.orderId, orderId))

    // Get customer details if userId exists
    let customer = null
    if (order.userId) {
      // Get user and profile data
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          phone: userProfiles.phone,
          billingAddress: sql<string>`COALESCE(
            (
              SELECT json_build_object(
                'street', ${addresses.street},
                'street2', ${addresses.street2},
                'city', ${addresses.city},
                'state', ${addresses.state},
                'postalCode', ${addresses.postalCode},
                'country', ${addresses.country}
              )::text
              FROM ${addresses}
              WHERE ${addresses.userId} = ${users.id}
              AND ${addresses.type} = 'billing'
              AND ${addresses.isDefault} = true
              LIMIT 1
            ),
            '{}'
          )`,
          shippingAddress: sql<string>`COALESCE(
            (
              SELECT json_build_object(
                'street', ${addresses.street},
                'street2', ${addresses.street2},
                'city', ${addresses.city},
                'state', ${addresses.state},
                'postalCode', ${addresses.postalCode},
                'country', ${addresses.country}
              )::text
              FROM ${addresses}
              WHERE ${addresses.userId} = ${users.id}
              AND ${addresses.type} = 'shipping'
              AND ${addresses.isDefault} = true
              LIMIT 1
            ),
            '{}'
          )`
        })
        .from(users)
        .leftJoin(userProfiles, eq(userProfiles.id, users.id))
        .where(eq(users.id, order.userId))
      
      if (user) {
        // Format customer data with proper field names
        customer = {
          id: user.id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          billingAddress: JSON.parse(user.billingAddress || '{}'),
          shippingAddress: JSON.parse(user.shippingAddress || '{}')
        }

        // If no addresses found in user's addresses, try to get them from the order
        if (!customer.billingAddress?.street && order.billingAddressId) {
          const [billingAddr] = await db
            .select()
            .from(addresses)
            .where(eq(addresses.id, order.billingAddressId))
          
          if (billingAddr) {
            customer.billingAddress = {
              street: billingAddr.street,
              street2: billingAddr.street2,
              city: billingAddr.city,
              state: billingAddr.state,
              postalCode: billingAddr.postalCode,
              country: billingAddr.country
            }
          }
        }

        if (!customer.shippingAddress?.street && order.shippingAddressId) {
          const [shippingAddr] = await db
            .select()
            .from(addresses)
            .where(eq(addresses.id, order.shippingAddressId))
          
          if (shippingAddr) {
            customer.shippingAddress = {
              street: shippingAddr.street,
              street2: shippingAddr.street2,
              city: shippingAddr.city,
              state: shippingAddr.state,
              postalCode: shippingAddr.postalCode,
              country: shippingAddr.country
            }
          }
        }
      }
    }

    return NextResponse.json({
      ...order,
      items,
      customer
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { items, ...orderData } = body

    // Calculate totals in actual dollars
    const subtotal = items.reduce((sum: number, item: any) => {
      const itemPrice = parseFloat(String(item.price))
      const itemQuantity = parseInt(String(item.quantity))
      return sum + (itemPrice * itemQuantity)
    }, 0)

    // Use actual dollar amounts without cents conversion
    const updatedOrderData = {
      ...orderData,
      totalAmount: subtotal + 
        (orderData.taxAmount ? parseFloat(orderData.taxAmount) : 0) +
        (orderData.shippingAmount ? parseFloat(orderData.shippingAmount) : 0) -
        (orderData.discountValue ? parseFloat(orderData.discountValue) : 0),
      subtotal,
      tax: orderData.taxAmount ? parseFloat(orderData.taxAmount) : 0,
      discount: orderData.discountValue ? parseFloat(orderData.discountValue) : 0,
      shippingFee: orderData.shippingAmount ? parseFloat(orderData.shippingAmount) : 0,
      updatedAt: new Date(),
    }

    // Update the order
    const [updatedOrder] = await query(async () => {
      return await db
        .update(orders)
        .set(updatedOrderData)
        .where(eq(orders.id, params.id))
        .returning()
    })

    // If there are items to update
    if (items && items.length > 0) {
      // Delete existing order items
      await query(async () => {
        await db.delete(orderItems).where(eq(orderItems.orderId, params.id))
      })

      // Insert new order items with actual dollar amounts
      const orderItemsData = items.map((item: any) => ({
        orderId: params.id,
        productId: parseInt(item.productId),
        name: item.productName,
        quantity: item.quantity,
        unitPrice: parseFloat(String(item.price)), // Use actual dollar amount
        totalPrice: parseFloat(String(item.price)) * parseInt(String(item.quantity)), // Use actual dollar amount
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
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 