import mysql from 'mysql2/promise';

let pool: mysql.Pool;

const connectDB = async (): Promise<void> => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cashstream',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Тест подключения
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected: ${connection.config.host}`);
    connection.release();
  } catch (error: any) {
    console.error(`❌ MySQL connection failed: ${error.message}`);
    console.warn('⚠️  Server will continue without database connection.');
  }
};

export { pool };
export default connectDB;

