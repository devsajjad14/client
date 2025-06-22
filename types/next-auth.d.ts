// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession['user']
  }

  interface User {
    role?: string
  }

  interface JWT {
    role?: string
  }
}

interface CustomUser extends DefaultSession['user'] {
  id: string
  role?: string
}

declare module 'next-auth' {
  interface Session {
    user: CustomUser
  }
}
