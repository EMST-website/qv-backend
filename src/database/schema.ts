export * from '@/modules/admins/schema/admins.schema';
export * from '@/modules/admins/schema/sessions.schema';
export * from '@/modules/admins/schema/refresh-tokens.schema';


// in production we will use the following: CREATE EXTENSION IF NOT EXISTS "pgcrypto" in the DATABASE to generate random UUIDs