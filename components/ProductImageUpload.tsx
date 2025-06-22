'use client'

import { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { FiUpload, FiX, FiPlus, FiImage, FiEdit2 } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface ImageSet {
  large: string
  medium: string
  small: string
}

interface TempImageFile {
  file: File
  preview: string
  isAlternate: boolean
  index?: number
}

interface ProductImageUploadProps {
  styleId: number
  onImagesChange: (images: { main: ImageSet | null; alternates: string[] }) => void
  initialImages?: { main: ImageSet | null; alternates: string[] }
  onUploadImages?: (images: { main: ImageSet | null; alternates: string[] }) => Promise<void>
  isUploading?: boolean
}

export interface ProductImageUploadRef {
  uploadAllImages: () => Promise<{ main: ImageSet | null; alternates: string[] }>
}

export const ProductImageUpload = forwardRef<ProductImageUploadRef, ProductImageUploadProps>(({
  styleId,
  onImagesChange,
  initialImages = { main: null, alternates: [] },
  onUploadImages,
  isUploading = false,
}, ref) => {
  const [mainImageSet, setMainImageSet] = useState<ImageSet | null>(initialImages.main)
  const [alternateImages, setAlternateImages] = useState<string[]>(initialImages.alternates)
  const [tempMainImage, setTempMainImage] = useState<TempImageFile | null>(null)
  const [tempAlternateImages, setTempAlternateImages] = useState<TempImageFile[]>([])
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)

  useEffect(() => {
    onImagesChange({ main: mainImageSet, alternates: alternateImages })
  }, [mainImageSet, alternateImages, onImagesChange])

  const handleImageSelect = async (file: File, isAlternate: boolean = false, index?: number) => {
    // Create preview URL
    const preview = URL.createObjectURL(file)
    
    if (isAlternate) {
      // Handle alternate image selection
      const tempImage: TempImageFile = {
        file,
        preview,
        isAlternate: true,
        index: index !== undefined ? index : tempAlternateImages.length
      }
      
      setTempAlternateImages(prev => {
        const newAlternates = [...prev]
        if (typeof index === 'number') {
          newAlternates[index] = tempImage // Replace existing
        } else {
          newAlternates.push(tempImage) // Add new
        }
        return newAlternates
      })
    } else {
      // Handle main image selection
      setTempMainImage({
        file,
        preview,
        isAlternate: false
      })
    }
  }

  const uploadAllImages = async (): Promise<{ main: ImageSet | null; alternates: string[] }> => {
    const uploadedImages = { main: null as ImageSet | null, alternates: [] as string[] }

    try {
      console.log('Starting image upload process...')
      console.log('Current mainImageSet:', mainImageSet)
      console.log('Current alternateImages:', alternateImages)
      console.log('Temp main image:', tempMainImage)
      console.log('Temp alternate images:', tempAlternateImages)

      // Upload main image if exists
      if (tempMainImage) {
        console.log('New main image selected, deleting old main images...')
        // Delete old main images if they exist (whether replacing or adding new)
        if (mainImageSet) {
          console.log('Deleting old main images:', mainImageSet)
          try {
            const deletePromises = []
            if (mainImageSet.large) {
              deletePromises.push(
                fetch(`/api/upload/product-image?url=${encodeURIComponent(mainImageSet.large)}`, { 
                  method: 'DELETE' 
                }).then(res => {
                  console.log('Deleted large image:', mainImageSet.large, 'Status:', res.status)
                  return res
                })
              )
            }
            if (mainImageSet.medium) {
              deletePromises.push(
                fetch(`/api/upload/product-image?url=${encodeURIComponent(mainImageSet.medium)}`, { 
                  method: 'DELETE' 
                }).then(res => {
                  console.log('Deleted medium image:', mainImageSet.medium, 'Status:', res.status)
                  return res
                })
              )
            }
            if (mainImageSet.small) {
              deletePromises.push(
                fetch(`/api/upload/product-image?url=${encodeURIComponent(mainImageSet.small)}`, { 
                  method: 'DELETE' 
                }).then(res => {
                  console.log('Deleted small image:', mainImageSet.small, 'Status:', res.status)
                  return res
                })
              )
            }
            await Promise.all(deletePromises)
            console.log('Successfully deleted all old main images')
          } catch (error) {
            console.error('Failed to delete old main images:', error)
          }
        }

        const formData = new FormData()
        formData.append('file', tempMainImage.file)
        formData.append('styleId', styleId.toString())

        const response = await fetch('/api/upload/product-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload main image')
        }

        const data = await response.json()
        console.log('Main image upload response:', data)
        uploadedImages.main = {
          large: data.mainImage,
          medium: data.mediumImage,
          small: data.smallImage,
        }
      } else if (mainImageSet) {
        // Keep existing main image if no new one selected
        console.log('Keeping existing main image:', mainImageSet)
        uploadedImages.main = mainImageSet
      }

      // Get all existing alternate images that will be kept (not replaced)
      const imagesToKeep = alternateImages.filter((existingImage, index) => {
        const wasReplaced = tempAlternateImages.some(temp => temp.index === index)
        return !wasReplaced
      })

      // Delete all existing alternate images that are not being kept
      const imagesToDelete = alternateImages.filter((existingImage, index) => {
        const wasReplaced = tempAlternateImages.some(temp => temp.index === index)
        return wasReplaced
      })

      console.log('Alternate images to keep:', imagesToKeep)
      console.log('Alternate images to delete:', imagesToDelete)

      // Delete old alternate images that are being replaced
      for (const imageUrl of imagesToDelete) {
        console.log('Deleting alternate image:', imageUrl)
        try {
          const deleteResponse = await fetch(`/api/upload/product-image?url=${encodeURIComponent(imageUrl)}`, { 
            method: 'DELETE' 
          })
          console.log('Delete response for', imageUrl, ':', deleteResponse.status)
          if (!deleteResponse.ok) {
            console.error('Failed to delete image:', imageUrl, 'Status:', deleteResponse.status)
          }
        } catch (error) {
          console.error('Error deleting alternate image:', imageUrl, error)
        }
      }

      // Upload new alternate images
      for (let i = 0; i < tempAlternateImages.length; i++) {
        const tempImage = tempAlternateImages[i]
        console.log('Uploading new alternate image:', tempImage.file.name)
        
        const formData = new FormData()
        formData.append('file', tempImage.file)
        formData.append('styleId', styleId.toString())
        formData.append('isAlternate', 'true')
        formData.append('alternateIndex', (i + 1).toString())

        const response = await fetch('/api/upload/product-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload alternate image')
        }

        const data = await response.json()
        console.log('Alternate image upload response:', data)
        uploadedImages.alternates.push(data.AltImage)
      }

      // Add existing alternate images that weren't replaced
      uploadedImages.alternates.push(...imagesToKeep)

      console.log('Final uploaded images:', uploadedImages)
      return uploadedImages
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    }
  }

  // Expose upload function to parent via ref
  useImperativeHandle(ref, () => ({
    uploadAllImages
  }), [tempMainImage, tempAlternateImages, mainImageSet, alternateImages, styleId])

  // Create dropzone hooks at the top level
  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return
      await handleImageSelect(acceptedFiles[0], false)
    },
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    disabled: isUploading,
  })

  const { getRootProps: getAlternateRootProps, getInputProps: getAlternateInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return
      await handleImageSelect(acceptedFiles[0], true)
    },
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    disabled: isUploading,
  })

  // Create fixed number of edit dropzone hooks (for up to 10 alternate images)
  const editDropzones = Array.from({ length: 10 }, (_, index) => {
    return useDropzone({
      onDrop: async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return
        await handleImageSelect(acceptedFiles[0], true, index)
      },
      accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
      maxFiles: 1,
      disabled: isUploading,
    })
  })

  const removeAlternateImage = (index: number) => {
    setTempAlternateImages(prev => prev.filter((_, i) => i !== index))
    setAlternateImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeMainImage = () => {
    setTempMainImage(null)
    setMainImageSet(null)
  }

  // Get display images (temp previews or existing images)
  const displayMainImage = tempMainImage ? tempMainImage.preview : (mainImageSet?.large || null)
  const displayAlternateImages = tempAlternateImages.map(temp => temp.preview).concat(
    alternateImages.filter((_, index) => !tempAlternateImages.some(temp => temp.index === index))
  )
  
  return (
    <div className="space-y-6">
      {/* Main Image Upload */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Main Product Image</h3>
        <p className="text-sm text-muted-foreground">
          Upload a high-quality image. The system will automatically create medium and small versions when you save the product.
        </p>
        <Card className="p-4">
          {isUploading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Uploading images...</p>
              </div>
            </div>
          ) : displayMainImage ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Large Image */}
                <div className="space-y-2">
                  <div className="relative aspect-square w-full group">
                    <Image
                      src={displayMainImage}
                      alt="Large product image"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {tempMainImage ? 'New Image (Preview)' : 'Large (Actual Size)'}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <div {...getMainRootProps()}>
                        <input {...getMainInputProps()} />
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={removeMainImage}
                        className="h-8 w-8"
                      >
                        <FiX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Large</p>
                </div>

                {/* Medium Image */}
                <div className="space-y-2">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={displayMainImage}
                      alt="Medium product image"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Medium (300px)
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Medium</p>
                </div>

                {/* Small Image */}
                <div className="space-y-2">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={displayMainImage}
                      alt="Small product image"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Small (180px)
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Small</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {tempMainImage ? 'New image selected - will be uploaded when you save' : 'Main Image'}
              </p>
            </div>
          ) : (
            <div
              {...getMainRootProps()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <input {...getMainInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <FiUpload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG or WEBP (max. 10MB)</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Alternate Images */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Alternate Images</h3>
        <p className="text-sm text-muted-foreground">
          Upload additional images for the product. Images will be uploaded when you save the product.
        </p>
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayAlternateImages.map((imageUrl, index) => {
              const { getRootProps, getInputProps } = editDropzones[index] || editDropzones[0];
              const isNewImage = tempAlternateImages.some(temp => temp.preview === imageUrl);
              
              return (
                <div key={index} className="relative group">
                  <Image
                    src={imageUrl}
                    alt={`Alternate image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {isNewImage && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAlternateImage(index)}
                      className="h-8 w-8"
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {!isUploading && (
              <div
                {...getAlternateRootProps()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex items-center justify-center text-center cursor-pointer hover:border-gray-300 transition-colors aspect-square"
              >
                <input {...getAlternateInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <FiPlus className="h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">Add Image</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}) 