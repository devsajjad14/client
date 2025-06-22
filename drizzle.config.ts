import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
