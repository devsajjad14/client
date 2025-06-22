import { NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import sharp from 'sharp'
import { generateImagePaths } from '@/lib/utils/image-utils'

// Helper function to ensure products directory exists
async function ensureProductsDirectory() {
  try {
    // List blobs to check if products directory exists
    const { blobs } = await list({ prefix: 'products/' })
    console.log('Products directory check - found blobs:', blobs.length)
    return true
  } catch (error) {
    console.log(
      'Products directory does not exist, will be created on first upload'
    )
    return false
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const styleId = formData.get('styleId') as string
    const isAlternate = formData.get('isAlternate') === 'true'
    const isVariant = formData.get('isVariant') === 'true'
    const variantId = formData.get('variantId') as string
    const color = formData.get('color') as string
    const alternateIndex = formData.get('alternateIndex') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(
      `Processing image upload - StyleId: ${styleId}, IsAlternate: ${isAlternate}, AlternateIndex: ${alternateIndex}`
    )

    // Ensure products directory exists (Vercel Blob creates directories automatically on first upload)
    await ensureProductsDirectory()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate proper file paths
    const imagePaths = generateImagePaths(styleId, isAlternate, alternateIndex)
    let imageBuffers: Buffer[]

    if (isAlternate) {
      // Only one image for alternate images (no resizing)
      imageBuffers = [await sharp(buffer).jpeg({ quality: 90 }).toBuffer()]
    } else {
      // Three sizes for main images
      imageBuffers = await Promise.all([
        // Large image (original size, max 1200px)
        sharp(buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 90 })
          .toBuffer(),
        // Medium image (300px)
        sharp(buffer)
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer(),
        // Small image (180px)
        sharp(buffer)
          .resize(180, 180, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer(),
      ])
    }

    // Upload to Vercel Blob with proper directory structure
    let blobUrls: string[]

    if (isAlternate) {
      // Upload single image for alternate
      const mainPath = imagePaths.main
      if (!mainPath) {
        throw new Error('Invalid alternate image path')
      }
      console.log(`Uploading alternate image to: ${mainPath}`)
      const blob = await put(mainPath, imageBuffers[0], {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      blobUrls = [blob.url]
      console.log(`Alternate image uploaded successfully: ${blob.url}`)
    } else {
      // Upload three images for main
      const {
        large: largePath,
        medium: mediumPath,
        small: smallPath,
      } = imagePaths
      if (!largePath || !mediumPath || !smallPath) {
        throw new Error('Invalid main image paths')
      }
      console.log(`Uploading main images to:`, imagePaths)
      const [largeBlob, mediumBlob, smallBlob] = await Promise.all([
        put(largePath, imageBuffers[0], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
        put(mediumPath, imageBuffers[1], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
        put(smallPath, imageBuffers[2], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
      ])
      blobUrls = [largeBlob.url, mediumBlob.url, smallBlob.url]
      console.log(`Main images uploaded successfully:`, blobUrls)
    }

    // Return appropriate response based on upload type
    if (isVariant) {
      return NextResponse.json({
        mainImage: blobUrls[0],
        mediumImage: blobUrls[1],
        smallImage: blobUrls[2],
        variantId,
        color,
      })
    } else if (isAlternate) {
      return NextResponse.json({
        altImage: blobUrls[0],
        AltImage: blobUrls[0],
        alternateIndex,
      })
    } else {
      return NextResponse.json({
        mainImage: blobUrls[0], // large
        mediumImage: blobUrls[1], // medium
        smallImage: blobUrls[2], // small
      })
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('DELETE request received for image URL:', imageUrl)

    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete image from Vercel Blob:', imageUrl)

    // Delete the image from Vercel Blob
    const result = await del(imageUrl)

    console.log('Vercel Blob delete result:', result)

    return NextResponse.json({ success: true, deletedUrl: imageUrl })
  } catch (error) {
    console.error('Error deleting image from Vercel Blob:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
