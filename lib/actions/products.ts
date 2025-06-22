'use server'

import { db } from '@/lib/db'
import { products, productVariations, productAlternateImages, orderItems } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq, sql } from 'drizzle-orm'

export interface ProductResponse {
  success: boolean
  error?: string
  message?: string
}

export async function createProduct(data: {
  styleId: number
  name: string
  style: string
  quantityAvailable: number
  onSale: string
  isNew: string
  smallPicture: string
  mediumPicture: string
  largePicture: string
  department: string
  type: string
  subType: string
  brand: string
  sellingPrice: number
  regularPrice: number
  longDescription: string
  of7: string | null
  of12: string | null
  of13: string | null
  of15: string | null
  forceBuyQtyLimit: string | null
  lastReceived: string | null
  tags: string
  urlHandle: string
  barcode: string
  sku: string
  trackInventory: boolean
  continueSellingOutOfStock: boolean
  stockQuantity: number
  variations: {
    skuId: number
    color: string
    attr1Alias: string
    hex: string
    size: string
    subSize: string | null
    quantity: number
    colorImage: string
    sku: string
    barcode: string
    available: boolean
  }[]
  alternateImages: {
    AltImage: string
  }[]
}): Promise<ProductResponse> {
  try {
    console.log('Creating product with data:', {
      trackInventory: data.trackInventory,
      continueSellingOutOfStock: data.continueSellingOutOfStock,
      stockQuantity: data.stockQuantity
    })

    // Create the product
    const [product] = await db.insert(products).values({
      styleId: data.styleId,
      name: data.name,
      style: data.style,
      quantityAvailable: data.quantityAvailable,
      onSale: data.onSale,
      isNew: data.isNew,
      smallPicture: data.smallPicture,
      mediumPicture: data.mediumPicture,
      largePicture: data.largePicture,
      department: data.department,
      type: data.type,
      subType: data.subType,
      brand: data.brand,
      sellingPrice: data.sellingPrice,
      regularPrice: data.regularPrice,
      longDescription: data.longDescription,
      of7: data.of7,
      of12: data.of12,
      of13: data.of13,
      of15: data.of15,
      forceBuyQtyLimit: data.forceBuyQtyLimit,
      lastReceived: data.lastReceived,
      tags: data.tags,
      urlHandle: data.urlHandle,
      barcode: data.barcode,
      sku: data.sku,
      trackInventory: data.trackInventory,
      continueSellingOutOfStock: data.continueSellingOutOfStock,
      stockQuantity: data.stockQuantity,
    }).returning()

    // Create variations
    if (data.variations.length > 0) {
      await db.insert(productVariations).values(
        data.variations.map(variation => ({
          productId: product.id,
          skuId: variation.skuId,
          color: variation.color,
          attr1Alias: variation.attr1Alias,
          hex: variation.hex,
          size: variation.size,
          subSize: variation.subSize,
          quantity: variation.quantity,
          colorImage: variation.colorImage,
          sku: variation.sku,
          barcode: variation.barcode,
          available: variation.available,
        }))
      )
    }

    // Create alternate images
    if (data.alternateImages.length > 0) {
      await db.insert(productAlternateImages).values(
        data.alternateImages.map(image => ({
          productId: product.id,
          AltImage: image.AltImage,
        }))
      )
    }

    revalidatePath('/admin/catalog/products')
    return { 
      success: true,
      message: 'Product created successfully'
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return { 
      success: false, 
      error: 'Failed to create product' 
    }
  }
}

export async function getProducts() {
  try {
    const allProducts = await db.query.products.findMany({
      with: {
        variations: true,
        alternateImages: true
      }
    })
    
    console.log(`Found ${allProducts.length} products`)
    return allProducts
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProduct(id: string) {
  console.log('getProduct called with id:', id)
  try {
    const styleId = parseInt(id)
    if (isNaN(styleId)) {
      console.error('Invalid styleId:', id)
      return null
    }

    console.log('Querying database with styleId:', styleId)
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.styleId, styleId),
      with: {
        variations: true,
        alternateImages: true
      },
      columns: {
        id: true,
        styleId: true,
        name: true,
        style: true,
        quantityAvailable: true,
        onSale: true,
        isNew: true,
        smallPicture: true,
        mediumPicture: true,
        largePicture: true,
        department: true,
        type: true,
        subType: true,
        brand: true,
        sellingPrice: true,
        regularPrice: true,
        longDescription: true,
        of7: true,
        of12: true,
        of13: true,
        of15: true,
        forceBuyQtyLimit: true,
        lastReceived: true,
        tags: true,
        urlHandle: true,
        barcode: true,
        sku: true,
        trackInventory: true,
        continueSellingOutOfStock: true,
        stockQuantity: true,
        lowStockThreshold: true,
      }
    })
    
    console.log('Database query result:', product)
    if (!product) {
      console.log('No product found with styleId:', styleId)
    }
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function updateProduct(id: string, data: {
  styleId: number
  name: string
  style: string
  quantityAvailable: number
  onSale: string
  isNew: string
  smallPicture: string
  mediumPicture: string
  largePicture: string
  department: string
  type: string
  subType: string
  brand: string
  sellingPrice: number
  regularPrice: number
  longDescription: string
  of7: string | null
  of12: string | null
  of13: string | null
  of15: string | null
  forceBuyQtyLimit: string | null
  lastReceived: string | null
  tags: string
  urlHandle: string
  barcode: string
  sku: string
  trackInventory: boolean
  continueSellingOutOfStock: boolean
  stockQuantity: number
  lowStockThreshold?: number
  variations: {
    skuId: number
    color: string
    attr1Alias: string
    hex: string
    size: string
    subSize: string | null
    quantity: number
    colorImage: string
    sku: string
    barcode: string
    available: boolean
  }[]
  alternateImages: {
    AltImage: string
  }[]
}): Promise<ProductResponse> {
  try {
    const styleId = parseInt(id)
    if (isNaN(styleId)) {
      return { success: false, error: 'Invalid product ID' }
    }

    // Update the product
    const [updatedProduct] = await db
      .update(products)
      .set({
        name: data.name,
        style: data.style,
        quantityAvailable: data.quantityAvailable,
        onSale: data.onSale,
        isNew: data.isNew,
        smallPicture: data.smallPicture,
        mediumPicture: data.mediumPicture,
        largePicture: data.largePicture,
        department: data.department,
        type: data.type,
        subType: data.subType,
        brand: data.brand,
        sellingPrice: data.sellingPrice,
        regularPrice: data.regularPrice,
        longDescription: data.longDescription,
        of7: data.of7,
        of12: data.of12,
        of13: data.of13,
        of15: data.of15,
        forceBuyQtyLimit: data.forceBuyQtyLimit,
        lastReceived: data.lastReceived,
        tags: data.tags,
        urlHandle: data.urlHandle,
        barcode: data.barcode,
        sku: data.sku,
        trackInventory: data.trackInventory,
        continueSellingOutOfStock: data.continueSellingOutOfStock,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
      })
      .where(eq(products.styleId, styleId))
      .returning()

    // Delete all existing variations
    await db.delete(productVariations)
      .where(eq(productVariations.productId, updatedProduct.id))

    // Create new variations
    if (data.variations.length > 0) {
      await db.insert(productVariations).values(
        data.variations.map(variation => ({
          productId: updatedProduct.id,
          skuId: variation.skuId,
          color: variation.color,
          attr1Alias: variation.attr1Alias,
          hex: variation.hex,
          size: variation.size,
          subSize: variation.subSize,
          quantity: variation.quantity,
          colorImage: variation.colorImage,
          sku: variation.sku,
          barcode: variation.barcode,
          available: variation.available,
        }))
      )
    }

    // Delete all existing alternate images
    await db.delete(productAlternateImages)
      .where(eq(productAlternateImages.productId, updatedProduct.id))

    // Create new alternate images
    if (data.alternateImages.length > 0) {
      await db.insert(productAlternateImages).values(
        data.alternateImages.map(image => ({
          productId: updatedProduct.id,
          AltImage: image.AltImage,
        }))
      )
    }

    revalidatePath('/admin/catalog/products')
    return { 
      success: true,
      message: 'Product updated successfully'
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return { 
      success: false, 
      error: 'Failed to update product' 
    }
  }
}

export async function deleteProduct(id: string): Promise<ProductResponse> {
  try {
    const styleId = parseInt(id)
    if (isNaN(styleId)) {
      return { 
        success: false, 
        error: 'Invalid product ID' 
      }
    }

    console.log('Deleting product with styleId:', styleId)

    // Get the product first
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.styleId, styleId)
    })

    if (!product) {
      return { 
        success: false, 
        error: 'Product not found' 
      }
    }

    console.log('Found product:', product)

    // Get order count for better error message
    type OrderCountResult = [{ order_count: number }]
    const orderResult = await db.execute<OrderCountResult>(
      sql`SELECT COUNT(DISTINCT order_id) as order_count FROM order_items WHERE product_id = ${product.id}`
    )
    
    console.log('Order check result:', orderResult)
    const orderCount = orderResult[0]?.order_count ?? 0

    if (orderCount > 0) {
      return {
        success: false,
        error: `Unable to delete "${product.name}" (Style ID: ${product.styleId})\n\nThis product appears in ${orderCount} order${orderCount === 1 ? '' : 's'} and cannot be deleted to maintain order history integrity.\n\nRecommended actions:\n• Consider deactivating the product instead\n• Set inventory to zero\n• Mark as discontinued`
      }
    }

    // If no orders exist, proceed with deletion
    console.log('No orders found, proceeding with deletion')

    // First delete variations
    const deletedVariations = await db.delete(productVariations)
      .where(eq(productVariations.productId, product.id))
      .returning()
    console.log('Deleted variations:', deletedVariations)

    // Then delete alternate images
    const deletedImages = await db.delete(productAlternateImages)
      .where(eq(productAlternateImages.productId, product.id))
      .returning()
    console.log('Deleted alternate images:', deletedImages)

    // Finally delete the product
    const deletedProduct = await db.delete(products)
      .where(eq(products.id, product.id))
      .returning()
    console.log('Deleted product:', deletedProduct)

    revalidatePath('/admin/catalog/products')
    return { 
      success: true,
      message: `Successfully deleted "${product.name}" (Style ID: ${product.styleId})`
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product'
    }
  }
} 