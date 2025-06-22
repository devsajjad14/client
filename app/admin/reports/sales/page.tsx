'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SalesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/reports/sales-analytics')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">Redirecting...</div>
    </div>
  )
} 