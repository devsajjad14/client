// auth.ts
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validators/auth'
import { accounts, users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
    }),
    // Custom linkAccount implementation with proper typing
    async linkAccount(account) {
      await db.insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      } as typeof accounts.$inferInsert)
      return account
    },
  },
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },

      // Add this profile callback to prevent automatic session creation
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),

    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials)
          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
          })

          if (!user?.password) return null
          const isValid = await bcrypt.compare(password, user.password)
          return isValid ? user : null
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

export async function getSessionData() {
  const session = await auth()
  return {
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null,
  }
}
