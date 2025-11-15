-- Migration: Create categories and subcategories tables
-- Date: 2024

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  isSystem BOOLEAN DEFAULT FALSE,
  userId VARCHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_system (isSystem),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица подкатегорий
CREATE TABLE IF NOT EXISTS subcategories (
  id VARCHAR(36) PRIMARY KEY,
  categoryId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (categoryId),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);

-- Вставить системные категории для трат
INSERT INTO categories (id, name, icon, isSystem) VALUES
('food', 'Еда и напитки', 'restaurant', TRUE),
('transport', 'Транспорт', 'directions-car', TRUE),
('shopping', 'Покупки', 'shopping-cart', TRUE),
('utilities', 'Коммунальные услуги', 'home', TRUE),
('health', 'Здоровье', 'favorite', TRUE),
('entertainment', 'Развлечения', 'sports-esports', TRUE),
('education', 'Образование', 'school', TRUE),
('bills', 'Счета', 'receipt', TRUE),
('personal', 'Личное', 'person', TRUE),
('travel', 'Путешествия', 'flight', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Еда и напитки"
INSERT INTO subcategories (id, categoryId, name) VALUES
('groceries', 'food', 'Продукты'),
('restaurant', 'food', 'Рестораны'),
('cafe', 'food', 'Кафе'),
('alcohol', 'food', 'Алкоголь'),
('snacks', 'food', 'Закуски'),
('delivery', 'food', 'Доставка еды')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Транспорт"
INSERT INTO subcategories (id, categoryId, name) VALUES
('gas', 'transport', 'Бензин'),
('parking', 'transport', 'Парковка'),
('public_transport', 'transport', 'Общественный транспорт'),
('taxi', 'transport', 'Такси'),
('car_repair', 'transport', 'Ремонт авто'),
('car_insurance', 'transport', 'Страховка авто')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Покупки"
INSERT INTO subcategories (id, categoryId, name) VALUES
('clothes', 'shopping', 'Одежда'),
('electronics', 'shopping', 'Электроника'),
('furniture', 'shopping', 'Мебель'),
('home_goods', 'shopping', 'Товары для дома'),
('books_shopping', 'shopping', 'Книги'),
('gifts', 'shopping', 'Подарки')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Коммунальные услуги"
INSERT INTO subcategories (id, categoryId, name) VALUES
('electricity', 'utilities', 'Электричество'),
('water', 'utilities', 'Вода'),
('gas_utilities', 'utilities', 'Газ'),
('internet', 'utilities', 'Интернет'),
('phone', 'utilities', 'Телефон'),
('heating', 'utilities', 'Отопление')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Здоровье"
INSERT INTO subcategories (id, categoryId, name) VALUES
('pharmacy', 'health', 'Аптека'),
('doctor', 'health', 'Врач'),
('dentist', 'health', 'Стоматолог'),
('hospital', 'health', 'Больница'),
('insurance_health', 'health', 'Страхование'),
('fitness', 'health', 'Фитнес')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Развлечения"
INSERT INTO subcategories (id, categoryId, name) VALUES
('movies', 'entertainment', 'Кино'),
('music', 'entertainment', 'Музыка'),
('games', 'entertainment', 'Игры'),
('hobbies', 'entertainment', 'Хобби'),
('concerts', 'entertainment', 'Концерты'),
('sports', 'entertainment', 'Спорт')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Образование"
INSERT INTO subcategories (id, categoryId, name) VALUES
('courses', 'education', 'Курсы'),
('books_education', 'education', 'Учебники'),
('tuition', 'education', 'Обучение'),
('certification', 'education', 'Сертификация'),
('workshops', 'education', 'Мастер-классы')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Счета"
INSERT INTO subcategories (id, categoryId, name) VALUES
('credit_card', 'bills', 'Кредитная карта'),
('loan', 'bills', 'Кредит'),
('rent', 'bills', 'Аренда'),
('subscriptions', 'bills', 'Подписки'),
('services', 'bills', 'Услуги')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Личное"
INSERT INTO subcategories (id, categoryId, name) VALUES
('haircut', 'personal', 'Стрижка'),
('beauty', 'personal', 'Красота'),
('laundry', 'personal', 'Стирка'),
('cleaning', 'personal', 'Уборка')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Путешествия"
INSERT INTO subcategories (id, categoryId, name) VALUES
('hotel', 'travel', 'Отель'),
('airplane', 'travel', 'Авиабилеты'),
('train', 'travel', 'Поезд'),
('vacation', 'travel', 'Отдых')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить системные категории для доходов
INSERT INTO categories (id, name, icon, isSystem) VALUES
('salary', 'Зарплата', 'work', TRUE),
('business', 'Бизнес', 'store', TRUE),
('investment', 'Инвестиции', 'trending-up', TRUE),
('freelance', 'Фриланс', 'laptop', TRUE),
('bonus', 'Бонусы', 'stars', TRUE),
('other', 'Другое', 'more', TRUE)
ON DUPLICATE KEY UPDATE id=id;

