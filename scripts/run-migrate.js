// Temporary script to run migrations
process.env.DATABASE_URL = 'postgresql://default:password@ep-small-dawn-a2zw9c4c.us-east-2.aws.neon.tech/neondb?sslmode=require';

require('tsx/cjs').cli(['scripts/migrate.ts']); 