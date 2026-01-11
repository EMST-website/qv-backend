// Admin schemas
export * from '@/modules/admins/schema/admins.schema';
export * from '@/modules/admins/schema/sessions.schema';
export * from '@/modules/admins/schema/refresh-tokens.schema';

// User schemas
export * from '@/modules/users/schema/users.schema';

// Organization schemas
export * from '@/modules/organizations/schema/organizations.schema';

// Webinar schemas
export * from '@/modules/webinars/schema/webinars.schema';
export * from '@/modules/webinars/schema/webinar-registrations.schema';

// in production we will use the following: CREATE EXTENSION IF NOT EXISTS "pgcrypto" in the DATABASE to generate random UUIDs