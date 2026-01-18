import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { admins } from '../src/modules/admins/schema/admins.schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedSuperAdmin() {
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log('🌱 Starting super admin seed...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

    // Check if super admin already exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, 'admin@example.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('⚠️  Super admin already exists!');
      console.log('📧 Email: admin@example.com');
      console.log('🔐 Password: SuperAdmin@123');
      return;
    }

    // Insert super admin
    const [newAdmin] = await db
      .insert(admins)
      .values({
        email: 'admin@example.com',
        password: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+971501234567',
        country: 'UAE',
        city: 'Dubai',
        role: 'SUPER_ADMIN',
      })
      .returning();

    console.log('✅ Super admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@example.com');
    console.log('🔐 Password: SuperAdmin@123');
    console.log('👤 Name:     Super Admin');
    console.log('🎭 Role:     SUPER_ADMIN');
    console.log('🆔 ID:       ' + newAdmin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 You can now login at: POST /api/v1/admins/login');
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    
    if (error.message?.includes('relation "admins" does not exist')) {
      console.log('\n💡 The admins table does not exist yet!');
      console.log('🔧 Run migrations first: npm run db:push');
      console.log('📝 Or generate migration: npx drizzle-kit generate');
    }
    
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedSuperAdmin()
  .then(() => {
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
