const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
// Загружаем переменные окружения (работает и в Docker, и локально)
require('dotenv').config();
// Если .env не найден, пробуем .env.production
if (!process.env.DB_HOST) {
  require('dotenv').config({ path: '.env.production' });
}

// Категории для расходов
const EXPENSE_CATEGORIES = [
  { name: 'Еда и напитки', subcategories: ['Продукты', 'Рестораны', 'Кафе', 'Доставка еды'] },
  { name: 'Транспорт', subcategories: ['Бензин', 'Парковка', 'Общественный транспорт', 'Такси'] },
  { name: 'Покупки', subcategories: ['Одежда', 'Электроника', 'Товары для дома', 'Книги'] },
  { name: 'Коммунальные услуги', subcategories: ['Электричество', 'Вода', 'Интернет', 'Телефон'] },
  { name: 'Здоровье', subcategories: ['Аптека', 'Врач', 'Стоматолог', 'Фитнес'] },
  { name: 'Развлечения', subcategories: ['Кино', 'Музыка', 'Игры', 'Концерты'] },
  { name: 'Образование', subcategories: ['Курсы', 'Учебники', 'Обучение'] },
  { name: 'Счета', subcategories: ['Кредитная карта', 'Кредит', 'Аренда', 'Подписки'] },
  { name: 'Личное', subcategories: ['Стрижка', 'Красота', 'Стирка'] },
  { name: 'Путешествия', subcategories: ['Отель', 'Авиабилеты', 'Поезд', 'Отдых'] },
];

// Категории для доходов
const INCOME_CATEGORIES = [
  'Зарплата',
  'Бизнес',
  'Инвестиции',
  'Фриланс',
  'Бонусы',
  'Другое',
];

// Названия операций
const EXPENSE_TITLES = [
  'Покупка продуктов',
  'Обед в ресторане',
  'Заправка автомобиля',
  'Оплата интернета',
  'Покупка одежды',
  'Визит к врачу',
  'Билеты в кино',
  'Оплата аренды',
  'Покупка книг',
  'Фитнес-абонемент',
  'Такси',
  'Покупка подарка',
  'Оплата кредита',
  'Покупка электроники',
  'Стрижка',
];

const INCOME_TITLES = [
  'Зарплата',
  'Доход от бизнеса',
  'Дивиденды',
  'Фриланс проект',
  'Премия',
  'Возврат налогов',
  'Продажа вещей',
  'Подарок',
];

// Валюты
const CURRENCIES = ['RUB', 'USD', 'EUR'];

// Функция для получения случайного элемента из массива
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Функция для получения случайного числа в диапазоне
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для получения случайной даты в диапазоне
function getRandomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

// Функция для форматирования даты в MySQL формат
function formatDateForMySQL(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Генерация случайной операции
function generateOperation(userId, startDate, endDate) {
  const type = Math.random() < 0.85 ? 'expense' : (Math.random() < 0.9 ? 'income' : 'transfer');
  
  let category, title, amount;
  
  if (type === 'expense') {
    const categoryData = getRandomItem(EXPENSE_CATEGORIES);
    const subcategory = Math.random() < 0.7 ? getRandomItem(categoryData.subcategories) : null;
    category = subcategory ? `${categoryData.name} > ${subcategory}` : categoryData.name;
    title = getRandomItem(EXPENSE_TITLES);
    amount = -Math.abs(getRandomNumber(100, 50000)); // Отрицательное число для расходов
  } else if (type === 'income') {
    category = getRandomItem(INCOME_CATEGORIES);
    title = getRandomItem(INCOME_TITLES);
    amount = Math.abs(getRandomNumber(5000, 200000)); // Положительное число для доходов
  } else {
    // transfer
    category = 'Переводы';
    title = 'Перевод между счетами';
    amount = Math.abs(getRandomNumber(1000, 50000));
  }
  
  const date = getRandomDate(startDate, endDate);
  const currency = getRandomItem(CURRENCIES);
  const timestamp = date.getTime();
  
  return {
    id: uuidv4(),
    userId,
    title,
    titleKey: null,
    amount,
    category,
    categoryKey: null,
    date: formatDateForMySQL(date),
    timestamp,
    type,
    fromAccount: type === 'transfer' ? 'Счет 1' : null,
    toAccount: type === 'transfer' ? 'Счет 2' : null,
    currency,
  };
}

async function generateOperations(userId, count = 50, daysBack = 90) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cashstream'
    });

    // Проверяем существование пользователя
    const [userRows] = await connection.execute(
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      console.log('❌ Пользователь не найден');
      return;
    }

    const user = userRows[0];
    console.log(`📋 Генерация операций для пользователя:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email || 'не указан'}`);
    console.log(`   Количество операций: ${count}`);
    console.log(`   Период: последние ${daysBack} дней\n`);

    // Вычисляем диапазон дат
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Генерируем операции
    const operations = [];
    for (let i = 0; i < count; i++) {
      operations.push(generateOperation(userId, startDate, endDate));
    }

    // Сортируем по дате (от старых к новым)
    operations.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Вставляем операции в базу данных
    console.log('💾 Сохранение операций в базу данных...');
    let successCount = 0;
    let errorCount = 0;

    for (const op of operations) {
      try {
        await connection.execute(
          `INSERT INTO operations (
            id, userId, title, titleKey, amount, category, categoryKey, 
            date, timestamp, type, fromAccount, toAccount, currency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            op.id,
            op.userId,
            op.title,
            op.titleKey,
            op.amount,
            op.category,
            op.categoryKey,
            op.date,
            op.timestamp,
            op.type,
            op.fromAccount,
            op.toAccount,
            op.currency,
          ]
        );
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Ошибка при создании операции "${op.title}":`, error.message);
      }
    }

    console.log('\n✅ Генерация завершена!');
    console.log(`   Успешно создано: ${successCount} операций`);
    if (errorCount > 0) {
      console.log(`   Ошибок: ${errorCount}`);
    }

    // Статистика по типам
    const stats = {
      expense: operations.filter(op => op.type === 'expense').length,
      income: operations.filter(op => op.type === 'income').length,
      transfer: operations.filter(op => op.type === 'transfer').length,
    };
    console.log('\n📊 Статистика:');
    console.log(`   Расходы: ${stats.expense}`);
    console.log(`   Доходы: ${stats.income}`);
    console.log(`   Переводы: ${stats.transfer}`);

    // Подсчет суммы
    const totalAmount = operations.reduce((sum, op) => sum + op.amount, 0);
    console.log(`\n💰 Общая сумма: ${totalAmount.toLocaleString('ru-RU')} RUB`);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Получаем параметры из командной строки
const userId = process.argv[2];
const count = parseInt(process.argv[3]) || 50;
const daysBack = parseInt(process.argv[4]) || 90;

if (!userId) {
  console.log('Использование: node scripts/generate-operations.js <userId> [count] [daysBack]');
  console.log('');
  console.log('Параметры:');
  console.log('  userId   - UUID пользователя (обязательно)');
  console.log('  count    - Количество операций (по умолчанию: 50)');
  console.log('  daysBack - Количество дней назад для генерации (по умолчанию: 90)');
  console.log('');
  console.log('Примеры:');
  console.log('  node scripts/generate-operations.js d4f205ea-6919-4c63-8677-c3f36b06a786');
  console.log('  node scripts/generate-operations.js d4f205ea-6919-4c63-8677-c3f36b06a786 100');
  console.log('  node scripts/generate-operations.js d4f205ea-6919-4c63-8677-c3f36b06a786 200 180');
  process.exit(1);
}

generateOperations(userId, count, daysBack).then(() => {
  process.exit(0);
});

