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
      queueLimit: 0,
      charset: 'utf8mb4' // Правильная кодировка для поддержки всех Unicode символов
    });

    // Устанавливаем кодировку для каждого нового соединения из пула
    pool.on('connection', async (connection: mysql.PoolConnection) => {
      // Важно выполнять команды в правильном порядке
      await connection.execute('SET character_set_client = utf8mb4');
      await connection.execute('SET character_set_results = utf8mb4');
      await connection.execute('SET character_set_connection = utf8mb4');
      await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
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

