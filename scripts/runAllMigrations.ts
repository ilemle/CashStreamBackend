import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runAllMigrations() {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cashstream',
      multipleStatements: true,
    });

    console.log(`✅ Connected to database`);

    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Сортируем, чтобы миграции запускались по порядку

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      console.log(`📄 Running migration: ${file}`);
      await connection.query(sql);
      console.log(`✅ Migration completed successfully: ${file}`);
    }

    console.log(`🎉 All migrations completed successfully`);
  } catch (error: any) {
    console.error(`❌ Migrations failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runAllMigrations();
