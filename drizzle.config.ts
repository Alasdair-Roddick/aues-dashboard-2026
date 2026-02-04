import type { Config } from 'drizzle-kit';
import 'dotenv/config';
import { config } from 'dotenv';

// Load .env.local for local development
config({ path: '.env.local' });

export default {
  schema: './app/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
