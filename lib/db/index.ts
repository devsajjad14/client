import { drizzle } from 'drizzle-orm/neon-http'
import { neon, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'

neonConfig.fetchConnectionCache = true

const sql = neon(process.env.DATABASE_URL!)

// Create a function to get a fresh connection
export const getConnection = () => {
  return drizzle(sql, { schema })
}

// Create a function to execute queries with retry logic
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
}

// Export the database instance
export const db = getConnection()

// Export a function to execute queries with retry logic
export const query = async <T>(operation: () => Promise<T>): Promise<T> => {
  return executeWithRetry(operation)
}
