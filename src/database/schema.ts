export * from '@/modules/admins/schema/admins.schema';
export * from '@/modules/admins/schema/sessions.schema';
export * from '@/modules/admins/schema/refresh-tokens.schema';

export * from '@/modules/countries/schema/countries.schema';
export * from '@/modules/countries/schema/cities.schema';

export * from '@/modules/users/schema/users.schema';
export * from '@/modules/organizations/organizations.schema';

export * from '@/modules/categories/categories.schema';
export * from '@/modules/products/products.schema';
// in production we will use the following: CREATE EXTENSION IF NOT EXISTS "pgcrypto" in the DATABASE to generate random UUIDs