import { NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import sharp from 'sharp'

// Helper function to ensure brands directory exists
async function ensureBrandsDirectory() {
  try {
    // List blobs to check if brands directory exists
    const { blobs } = await list({ prefix: 'brands/' })
    console.log('Brands directory check - found blobs:', blobs.length)
    return true
  } catch (error) {
    console.log(
      'Brands directory does not exist, will be created on first upload'
    )
    return false
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const brandId = formData.get('brandId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(
      `Processing brand logo upload - BrandId: ${brandId}, File: ${file.name}, Size: ${file.size}`
    )

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size should be less than 5MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' },
        { status: 400 }
      )
    }

    // Ensure brands directory exists (Vercel Blob creates directories automatically on first upload)
    await ensureBrandsDirectory()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = brandId ? `brand_${brandId}_${timestamp}.${fileExtension}` : `brand_${timestamp}.${fileExtension}`
    const filePath = `brands/${filename}`

    // Process image: Resize to max 300x300px while maintaining aspect ratio
    const processedBuffer = await sharp(buffer)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // Upload to Vercel Blob
    console.log(`Uploading brand logo to: ${filePath}`)
    const blob = await put(filePath, processedBuffer, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    console.log(`Brand logo uploaded successfully: ${blob.url}`)

    return NextResponse.json({
      success: true,
      url: blob.url,
      path: filePath
    })

  } catch (error) {
    console.error('Error uploading brand logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload brand logo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('DELETE request received for brand logo URL:', imageUrl)

    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete brand logo from Vercel Blob:', imageUrl)

    // Delete the image from Vercel Blob
    const result = await del(imageUrl)

    console.log('Vercel Blob delete result:', result)

    return NextResponse.json({ success: true, deletedUrl: imageUrl })
  } catch (error) {
    console.error('Error deleting brand logo from Vercel Blob:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete brand logo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 