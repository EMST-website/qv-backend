import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking Database Connection and Tables...\n');
    
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Get database name
    const dbResult = await pool.query('SELECT current_database()');
    console.log('📊 Database:', dbResult.rows[0].current_database);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // List all tables
    console.log('📋 Listing all tables:\n');
    const tablesResult = await pool.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found in the database!');
      console.log('💡 Run: npm run db:push to create tables\n');
    } else {
      console.log(`Found ${tablesResult.rows.length} table(s):\n`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Get column info for each table
      for (const table of tablesResult.rows) {
        console.log(`\n📄 Table: ${table.table_name}`);
        console.log('─'.repeat(50));
        
        const columnsResult = await pool.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = $1
          ORDER BY ordinal_position
        `, [table.table_name]);

        columnsResult.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`  • ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
        });

        // Count rows
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
        console.log(`\n  📊 Row count: ${countResult.rows[0].count}`);
      }
    }

    // List all enums
    console.log('\n\n🔤 Listing all ENUM types:\n');
    const enumsResult = await pool.query(`
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder
    `);

    if (enumsResult.rows.length === 0) {
      console.log('⚠️  No enum types found');
    } else {
      const enums = new Map<string, string[]>();
      enumsResult.rows.forEach(row => {
        if (!enums.has(row.enum_name)) {
          enums.set(row.enum_name, []);
        }
        enums.get(row.enum_name)!.push(row.enum_value);
      });

      enums.forEach((values, name) => {
        console.log(`  • ${name}: [${values.join(', ')}]`);
      });
    }

    // Check expected tables against actual
    console.log('\n\n✅ Expected Tables Check:\n');
    const expectedTables = [
      'users',
      'organizations', 
      'webinars',
      'webinar_registrations',
      'admins',
      'admins_sessions',
      'admins_refresh_tokens'
    ];

    const actualTables = tablesResult.rows.map(r => r.table_name);
    
    expectedTables.forEach(table => {
      if (actualTables.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - MISSING`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database check complete!\n');

  } catch (error) {
    console.error('❌ Database check failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

checkDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
