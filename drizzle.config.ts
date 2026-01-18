import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true, // log verbose output
  strict: true, // fail if any schema is not found in the database
});