-- Migration: Create categories and subcategories tables
-- Date: 2024

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  categoryId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (categoryId),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);

-- Вставить системные категории для трат
INSERT INTO categories (name, icon, isSystem) VALUES
('Еда и напитки', 'restaurant', TRUE),         -- id = 1
('Транспорт', 'directions-car', TRUE),          -- id = 2
('Покупки', 'shopping-cart', TRUE),             -- id = 3
('Коммунальные услуги', 'home', TRUE),          -- id = 4
('Здоровье', 'favorite', TRUE),                  -- id = 5
('Развлечения', 'sports-esports', TRUE),         -- id = 6
('Образование', 'school', TRUE),                 -- id = 7
('Счета', 'receipt', TRUE),                      -- id = 8
('Личное', 'person', TRUE),                      -- id = 9
('Путешествия', 'flight', TRUE)                  -- id = 10
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Еда и напитки" (id = 1)
INSERT INTO subcategories (id, categoryId, name) VALUES
('groceries', 1, 'Продукты'),
('restaurant', 1, 'Рестораны'),
('cafe', 1, 'Кафе'),
('alcohol', 1, 'Алкоголь'),
('snacks', 1, 'Закуски'),
('delivery', 1, 'Доставка еды')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Транспорт" (id = 2)
INSERT INTO subcategories (id, categoryId, name) VALUES
('gas', 2, 'Бензин'),
('parking', 2, 'Парковка'),
('public_transport', 2, 'Общественный транспорт'),
('taxi', 2, 'Такси'),
('car_repair', 2, 'Ремонт авто'),
('car_insurance', 2, 'Страховка авто')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Покупки" (id = 3)
INSERT INTO subcategories (id, categoryId, name) VALUES
('clothes', 3, 'Одежда'),
('electronics', 3, 'Электроника'),
('furniture', 3, 'Мебель'),
('home_goods', 3, 'Товары для дома'),
('books_shopping', 3, 'Книги'),
('gifts', 3, 'Подарки')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Коммунальные услуги" (id = 4)
INSERT INTO subcategories (id, categoryId, name) VALUES
('electricity', 4, 'Электричество'),
('water', 4, 'Вода'),
('gas_utilities', 4, 'Газ'),
('internet', 4, 'Интернет'),
('phone', 4, 'Телефон'),
('heating', 4, 'Отопление')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Здоровье" (id = 5)
INSERT INTO subcategories (id, categoryId, name) VALUES
('pharmacy', 5, 'Аптека'),
('doctor', 5, 'Врач'),
('dentist', 5, 'Стоматолог'),
('hospital', 5, 'Больница'),
('insurance_health', 5, 'Страхование'),
('fitness', 5, 'Фитнес')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Развлечения" (id = 6)
INSERT INTO subcategories (id, categoryId, name) VALUES
('movies', 6, 'Кино'),
('music', 6, 'Музыка'),
('games', 6, 'Игры'),
('hobbies', 6, 'Хобби'),
('concerts', 6, 'Концерты'),
('sports', 6, 'Спорт')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Образование" (id = 7)
INSERT INTO subcategories (id, categoryId, name) VALUES
('courses', 7, 'Курсы'),
('books_education', 7, 'Учебники'),
('tuition', 7, 'Обучение'),
('certification', 7, 'Сертификация'),
('workshops', 7, 'Мастер-классы')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Счета" (id = 8)
INSERT INTO subcategories (id, categoryId, name) VALUES
('credit_card', 8, 'Кредитная карта'),
('loan', 8, 'Кредит'),
('rent', 8, 'Аренда'),
('subscriptions', 8, 'Подписки'),
('services', 8, 'Услуги')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Личное" (id = 9)
INSERT INTO subcategories (id, categoryId, name) VALUES
('haircut', 9, 'Стрижка'),
('beauty', 9, 'Красота'),
('laundry', 9, 'Стирка'),
('cleaning', 9, 'Уборка')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить подкатегории для "Путешествия" (id = 10)
INSERT INTO subcategories (id, categoryId, name) VALUES
('hotel', 10, 'Отель'),
('airplane', 10, 'Авиабилеты'),
('train', 10, 'Поезд'),
('vacation', 10, 'Отдых')
ON DUPLICATE KEY UPDATE id=id;

-- Вставить системные категории для доходов
INSERT INTO categories (name, icon, isSystem) VALUES
('Зарплата', 'work', TRUE),                      -- id = 11
('Бизнес', 'store', TRUE),                       -- id = 12
('Инвестиции', 'trending-up', TRUE),             -- id = 13
('Фриланс', 'laptop', TRUE),                     -- id = 14
('Бонусы', 'stars', TRUE),                       -- id = 15
('Другое', 'more', TRUE)                         -- id = 16
ON DUPLICATE KEY UPDATE name=name;

