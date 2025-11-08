const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testPassword(email, testPassword) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cashstream'
    });

    const [rows] = await connection.execute(
      'SELECT id, name, email, password, createdAt FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      console.log('❌ Пользователь не найден');
      return;
    }

    const user = rows[0];
    console.log('📋 Информация о пользователе:');
    console.log('  ID:', user.id);
    console.log('  Имя:', user.name);
    console.log('  Email:', user.email);
    console.log('  Дата создания:', user.createdAt);
    console.log('\n🔐 Хеш пароля в БД:');
    console.log('  ' + user.password);
    console.log('  Длина:', user.password.length);
    console.log('  Начинается с $2b$:', user.password.startsWith('$2b$'));

    console.log('\n🧪 Тестирование пароля:');
    console.log('  Введенный пароль:', testPassword);
    console.log('  Длина:', testPassword.length);

    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('\n✅ Результат проверки:');
    console.log('  Пароль совпадает:', isMatch ? 'ДА ✅' : 'НЕТ ❌');

    if (!isMatch) {
      console.log('\n⚠️  Пароль не совпадает. Возможные причины:');
      console.log('  1. Пароль был изменен, но не сохранился в БД');
      console.log('  2. В пароле есть лишние пробелы');
      console.log('  3. Неправильная кодировка');
      console.log('  4. Пароль был изменен через другой метод');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

const email = process.argv[2] || 'aleksandr20022000@mail.ru';
const password = process.argv[3] || '';

if (!password) {
  console.log('Использование: node scripts/test-password.js <email> <password>');
  console.log('Пример: node scripts/test-password.js aleksandr20022000@mail.ru mypassword');
  process.exit(1);
}

testPassword(email, password).then(() => {
  process.exit(0);
});

