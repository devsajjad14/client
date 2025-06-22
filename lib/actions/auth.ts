'use server'

import { signIn } from '@/auth'
import { signupSchema } from '../validators/auth'
import { db } from '../db'
import bcrypt from 'bcryptjs'
import { users } from '../db/schema'
import { AuthError } from 'next-auth'

export async function loginAction(
  prevState: { error?: string; callbackUrl?: string } | undefined,
  formData: FormData
) {
  try {
    const callbackUrl = formData.get('callbackUrl')?.toString() || '/account'
    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()

    // If password not provided yet, just return to show password field
    if (!password) {
      return {
        callbackUrl: decodeURIComponent(callbackUrl),
      }
    }

    try {
      await signIn('credentials', { email, password, redirect: false })
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return {
              error: 'Invalid credentials',
              callbackUrl: decodeURIComponent(callbackUrl),
            }
          case 'CredentialsSignin':
            throw error
          default:
            return {
              error: 'Something went wrong',
              callbackUrl: decodeURIComponent(callbackUrl),
            }
        }
      }

      throw error
    }

    return {
      redirect: decodeURIComponent(callbackUrl),
    }
  } catch (error) {
    console.log(error)
    return {
      error: 'An error occurred during login',
      callbackUrl: formData.get('callbackUrl')?.toString() || '/account',
    }
  }
}

export async function signupAction(
  prevState:
    | { error?: string; message?: string; callbackUrl?: string }
    | undefined,
  formData: FormData
) {
  try {
    const callbackUrl = formData.get('callbackUrl')?.toString() || '/account'
    const { name, email, password } = signupSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (existingUser) {
      return {
        error: 'Email already in use',
        callbackUrl,
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    })

    // Auto login after signup
    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      return {
        redirect: callbackUrl, // Redirect to checkout after successful signup and login
      }
    } catch (error) {
      console.error('Auto-login error:', error)
      return {
        error: 'Account created but login failed. Please try signing in.',
        callbackUrl: '/login',
      }
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Failed to create account',
      callbackUrl: formData.get('callbackUrl')?.toString() || '/account',
    }
  }
}
