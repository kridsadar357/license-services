import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  driver: 'mysql2',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config;

