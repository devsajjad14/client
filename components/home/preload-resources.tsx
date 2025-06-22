'use client'

import { useEffect } from 'react'

interface PreloadResourcesProps {
  images: string[]
}

export function PreloadResources({ images }: PreloadResourcesProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !images?.length) return

    // Preload first image immediately
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = images[0]
    link.fetchPriority = 'high'
    document.head.appendChild(link)

    // Preload others after delay
    const timer = setTimeout(() => {
      images.slice(1).forEach((src) => {
        const img = new Image()
        img.src = src
      })
    }, 500)

    return () => {
      document.head.removeChild(link)
      clearTimeout(timer)
    }
  }, [images])

  return null
}
