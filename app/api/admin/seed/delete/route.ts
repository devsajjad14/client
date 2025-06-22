import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  products, 
  productAlternateImages,
  productVariations,
  brands,
  apiIntegrations,
  coupons,
  reviews,
  attributes,
  attributeValues,
  userProfiles,
  addresses,
  settings,
  dataModeSettings,
  taxonomy,
  users,
  orders,
  orderItems
} from '@/lib/db/schema'

export async function POST() {
  try {
    console.log('Starting data deletion...')
    const results: Record<string, { status: string; message: string; count: number }> = {}

    // Delete in order of dependencies
    try {
      // 1. Delete reviews first
      console.log('Deleting reviews...')
      await db.delete(reviews)
      results.reviews = {
        status: 'completed',
        message: 'Successfully deleted reviews',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting reviews:', error)
      results.reviews = {
        status: 'error',
        message: 'Failed to delete reviews',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 2. Delete order items second
      console.log('Deleting order items...')
      await db.delete(orderItems)
      results.order_items = {
        status: 'completed',
        message: 'Successfully deleted order items',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting order items:', error)
      results.order_items = {
        status: 'error',
        message: 'Failed to delete order items',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete order items',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 3. Delete orders third
      console.log('Deleting orders...')
      await db.delete(orders)
      results.orders = {
        status: 'completed',
        message: 'Successfully deleted orders',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting orders:', error)
      results.orders = {
        status: 'error',
        message: 'Failed to delete orders',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete orders',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 4. Delete product alternate images fourth
      console.log('Deleting product alternate images...')
      await db.delete(productAlternateImages)
      results.product_alternate_images = {
        status: 'completed',
        message: 'Successfully deleted product alternate images',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting product alternate images:', error)
      results.product_alternate_images = {
        status: 'error',
        message: 'Failed to delete product alternate images',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete product alternate images',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 5. Delete product variations fifth
      console.log('Deleting product variations...')
      await db.delete(productVariations)
      results.product_variations = {
        status: 'completed',
        message: 'Successfully deleted product variations',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting product variations:', error)
      results.product_variations = {
        status: 'error',
        message: 'Failed to delete product variations',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete product variations',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 6. Delete attribute values sixth
      console.log('Deleting attribute values...')
      await db.delete(attributeValues)
      results.attribute_values = {
        status: 'completed',
        message: 'Successfully deleted attribute values',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting attribute values:', error)
      results.attribute_values = {
        status: 'error',
        message: 'Failed to delete attribute values',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete attribute values',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 7. Delete attributes seventh
      console.log('Deleting attributes...')
      await db.delete(attributes)
      results.attributes = {
        status: 'completed',
        message: 'Successfully deleted attributes',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting attributes:', error)
      results.attributes = {
        status: 'error',
        message: 'Failed to delete attributes',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete attributes',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 8. Delete products eighth
      console.log('Deleting products...')
      await db.delete(products)
      results.products = {
        status: 'completed',
        message: 'Successfully deleted products',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting products:', error)
      results.products = {
        status: 'error',
        message: 'Failed to delete products',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete products',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 9. Delete addresses ninth
      console.log('Deleting addresses...')
      await db.delete(addresses)
      results.addresses = {
        status: 'completed',
        message: 'Successfully deleted addresses',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting addresses:', error)
      results.addresses = {
        status: 'error',
        message: 'Failed to delete addresses',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete addresses',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 10. Delete user profiles tenth
      console.log('Deleting user profiles...')
      await db.delete(userProfiles)
      results.user_profiles = {
        status: 'completed',
        message: 'Successfully deleted user profiles',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting user profiles:', error)
      results.user_profiles = {
        status: 'error',
        message: 'Failed to delete user profiles',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete user profiles',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 11. Delete API integration eleventh
      console.log('Deleting API integration...')
      await db.delete(apiIntegrations)
      results.api_integration = {
        status: 'completed',
        message: 'Successfully deleted API integration',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting API integration:', error)
      results.api_integration = {
        status: 'error',
        message: 'Failed to delete API integration',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete API integration',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 12. Delete settings twelfth
      console.log('Deleting settings...')
      await db.delete(settings)
      results.settings = {
        status: 'completed',
        message: 'Successfully deleted settings',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting settings:', error)
      results.settings = {
        status: 'error',
        message: 'Failed to delete settings',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 13. Delete data mode settings thirteenth
      console.log('Deleting data mode settings...')
      await db.delete(dataModeSettings)
      results.data_mode_settings = {
        status: 'completed',
        message: 'Successfully deleted data mode settings',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting data mode settings:', error)
      results.data_mode_settings = {
        status: 'error',
        message: 'Failed to delete data mode settings',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete data mode settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 14. Delete coupons fourteenth
      console.log('Deleting coupons...')
      await db.delete(coupons)
      results.coupons = {
        status: 'completed',
        message: 'Successfully deleted coupons',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting coupons:', error)
      results.coupons = {
        status: 'error',
        message: 'Failed to delete coupons',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete coupons',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 15. Delete taxonomy fifteenth
      console.log('Deleting taxonomy...')
      await db.delete(taxonomy)
      results.taxonomy = {
        status: 'completed',
        message: 'Successfully deleted taxonomy',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting taxonomy:', error)
      results.taxonomy = {
        status: 'error',
        message: 'Failed to delete taxonomy',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete taxonomy',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 16. Delete brands sixteenth
      console.log('Deleting brands...')
      await db.delete(brands)
      results.brands = {
        status: 'completed',
        message: 'Successfully deleted brands',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting brands:', error)
      results.brands = {
        status: 'error',
        message: 'Failed to delete brands',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete brands',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    try {
      // 17. Delete users last
      console.log('Deleting users...')
      await db.delete(users)
      results.users = {
        status: 'completed',
        message: 'Successfully deleted users',
        count: 0
      }
    } catch (error) {
      console.error('Error deleting users:', error)
      results.users = {
        status: 'error',
        message: 'Failed to delete users',
        count: 0
      }
      return NextResponse.json({ 
        message: 'Failed to delete users',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 })
    }

    console.log('Data deletion completed')
    return NextResponse.json({ 
      message: 'Data deleted successfully',
      results
    })
  } catch (error) {
    console.error('Data deletion failed:', error)
    return NextResponse.json({ 
      message: 'Data deletion failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 