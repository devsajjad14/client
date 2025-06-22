import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/account', '/dashboard']

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const isAuthenticated = !!req.auth
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    // Include full path as callback URL
    loginUrl.searchParams.set(
      'callbackUrl',
      req.nextUrl.pathname + req.nextUrl.search
    )
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

// List of routes that should be dynamic
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current route should be dynamic
  if (DYNAMIC_ROUTES.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-store')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
