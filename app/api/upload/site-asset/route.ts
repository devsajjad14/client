import { NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import sharp from 'sharp'

// Helper function to ensure site directory exists
async function ensureSiteDirectory() {
  try {
    // List blobs to check if site directory exists
    const { blobs } = await list({ prefix: 'site/' })
    console.log('Site directory check - found blobs:', blobs.length)
    return true
  } catch (error) {
    console.log('Site directory does not exist, will be created on first upload')
    return false
  }
}

// Helper function to generate proper file paths for site assets
function generateSiteAssetPath(type: 'logo' | 'favicon', originalName: string): string {
  const baseDir = 'site'
  const timestamp = Date.now()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  const extension = originalName.split('.').pop() || 'jpg'
  
  if (type === 'logo') {
    return `${baseDir}/logo_${timestamp}_${nameWithoutExt}.${extension}`
  } else {
    return `${baseDir}/favicon_${timestamp}_${nameWithoutExt}.${extension}`
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'logo' | 'favicon'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid asset type. Must be "logo" or "favicon"' },
        { status: 400 }
      )
    }

    console.log(`Processing ${type} upload - File: ${file.name}, Size: ${file.size}`)

    // Ensure site directory exists
    await ensureSiteDirectory()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate file path
    const filePath = generateSiteAssetPath(type, file.name)
    
    // Process image based on type
    let processedBuffer: Buffer
    
    if (type === 'logo') {
      // Logo: Resize to max 200x200px while maintaining aspect ratio
      processedBuffer = await sharp(buffer)
        .resize(200, 200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toBuffer()
    } else {
      // Favicon: Resize to 32x32px
      processedBuffer = await sharp(buffer)
        .resize(32, 32, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer()
    }

    // Upload to Vercel Blob
    console.log(`Uploading ${type} to: ${filePath}`)
    const blob = await put(filePath, processedBuffer, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    console.log(`${type} uploaded successfully: ${blob.url}`)

    return NextResponse.json({
      success: true,
      url: blob.url,
      type: type,
      path: filePath
    })

  } catch (error) {
    console.error('Error uploading site asset:', error)
    return NextResponse.json(
      { error: 'Failed to upload site asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    console.log('DELETE request received for site asset URL:', imageUrl)
    
    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete site asset from Vercel Blob:', imageUrl)
    
    // Delete the image from Vercel Blob
    const result = await del(imageUrl)
    
    console.log('Vercel Blob delete result:', result)
    
    return NextResponse.json({ success: true, deletedUrl: imageUrl })
  } catch (error) {
    console.error('Error deleting site asset from Vercel Blob:', error)
    return NextResponse.json(
      { error: 'Failed to delete site asset', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 