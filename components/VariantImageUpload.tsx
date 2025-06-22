'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { FiUpload, FiX, FiEdit2 } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface VariantImageUploadProps {
  variantId: string
  color: string
  initialImage?: string
  onImageChange: (variantId: string, imageUrl: string) => void
  styleId: number
}

export function VariantImageUpload({ variantId, color, initialImage, onImageChange, styleId }: VariantImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    console.log('VariantImageUpload - initialImage changed:', initialImage)
    if (initialImage) {
      setImage(initialImage)
    }
  }, [initialImage])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return
      await handleImageUpload(acceptedFiles[0])
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  })

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('styleId', styleId.toString())
      formData.append('isVariant', 'true')
      formData.append('variantId', variantId)
      formData.append('color', color)

      const response = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      console.log('Variant image upload response:', data)

      setImage(data.mainImage)
      onImageChange(variantId, data.mainImage)
      toast.success('Variant image uploaded successfully')
    } catch (error) {
      console.error('Error uploading variant image:', error)
      toast.error('Failed to upload variant image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative aspect-square w-24 h-24 group">
      {image ? (
        <>
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt={`${color} variant image`}
              fill
              className="object-cover rounded-lg"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
              >
                <FiEdit2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                setImage(null)
                onImageChange(variantId, '')
              }}
              className="h-8 w-8"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div
          {...getRootProps()}
          className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...getInputProps()} />
          <FiUpload className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  )
} 