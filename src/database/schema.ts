// Admin schemas
export * from '@/modules/admins/schema/admins.schema';
export * from '@/modules/admins/schema/sessions.schema';
export * from '@/modules/admins/schema/refresh-tokens.schema';

export * from '@/modules/countries/schema/countries.schema';
export * from '@/modules/countries/schema/cities.schema';

// User schemas
export * from '@/modules/users/schema/users.schema';

// Webinar schemas
export * from '@/modules/webinars/schema/webinars.schema';
export * from '@/modules/webinars/schema/webinar-registrations.schema';

export * from '@/modules/users/schema/users.schema';
export * from '@/modules/organizations/organizations.schema';

export * from '@/modules/categories/categories.schema';
export * from '@/modules/products/products.schema';
export * from '@/modules/articles/articles.schema';
export * from '@/modules/stories/stories.schema';
// in production we will use the following: CREATE EXTENSION IF NOT EXISTS "pgcrypto" in the DATABASE to generate random UUIDs