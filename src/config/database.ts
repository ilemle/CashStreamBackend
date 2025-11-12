import mysql from 'mysql2/promise';

let pool: mysql.Pool;

const connectDB = async (): Promise<void> => {
  let retries = 5;
  while (retries > 0) {
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
      return; // Успешное подключение, выходим из функции
    } catch (error: any) {
      console.error(`❌ MySQL connection failed: ${error.message}`);
      retries--;
      if (retries > 0) {
        console.warn(`⚠️  Retrying MySQL connection in 5 seconds... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 5000)); // Ждем 5 секунд перед повторной попыткой
      } else {
        console.error('❌ All MySQL connection retries failed.');
        console.warn('⚠️  Server will continue without database connection.');
      }
    }
  }
};

export { pool };
export default connectDB;

