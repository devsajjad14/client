import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

import { db } from '@/lib/db'
import { up } from '@/lib/db/migrations/0004_fix_theme_settings'

up(db).then(() => {
  console.log('Theme settings fixed successfully')
  process.exit(0)
}).catch((err) => {
  console.error('Error fixing theme settings:', err)
  process.exit(1)
}) 