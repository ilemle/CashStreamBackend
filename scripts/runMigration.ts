import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration(filename: string) {
  let connection: mysql.Connection | null = null;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cashstream',
      multipleStatements: true, // Позволяет выполнять несколько SQL команд
    });

    console.log(`✅ Connected to database`);

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log(`📄 Running migration: ${filename}`);

    // Execute migration
    await connection.query(sql);

    console.log(`✅ Migration completed successfully: ${filename}`);
  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Get migration filename from command line arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration filename');
  console.log('Usage: ts-node scripts/runMigration.ts <migration-file.sql>');
  process.exit(1);
}

runMigration(migrationFile);

