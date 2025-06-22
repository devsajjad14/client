// app/layout.tsx

import './globals.css'
import { CartProvider } from '@/components/providers/CartProvider'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'
import { Providers } from './providers'
import MainLayout from '@/components/layout/MainLayout'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/toaster'
import { Inter } from 'next/font/google'
import { Toaster as SonnerToaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

// List of routes that should skip taxonomy fetching
const DYNAMIC_ROUTES = [
  '/logout',
  '/_not-found',
  '/account',
  '/cart',
  '/checkout',
  '/login',
  '/signup',
  '/admin',
  '/dashboard'
]

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if current route should skip taxonomy fetching
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || ''
  const shouldSkipTaxonomy = DYNAMIC_ROUTES.some(route => pathname.startsWith(route))

  // Only fetch taxonomy data for non-dynamic routes
  const txData = shouldSkipTaxonomy ? [] : await fetchTaxonomyData()

  return (
    <html lang='en' className={`${inter.variable}`}>
      <head>
        <link rel='preconnect' href='https://www.alumnihall.com' />
        <link
          rel='preconnect'
          href='https://your-cdn.com'
          crossOrigin='anonymous'
        />
        <link rel='dns-prefetch' href='https://www.alumnihall.com' />
      </head>

      <body>
        <Providers>
          <CartProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <MainLayout txData={txData}>{children}</MainLayout>
            </Suspense>
          </CartProvider>
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
