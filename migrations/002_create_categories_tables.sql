-- Migration: Create categories and subcategories tables
-- Date: 2024

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
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
  id INT AUTO_INCREMENT PRIMARY KEY,
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

-- Вставить подкатегории для "Еда и напитки" (categoryId = 1)
INSERT INTO subcategories (categoryId, name) VALUES
(1, 'Продукты'),
(1, 'Рестораны'),
(1, 'Кафе'),
(1, 'Алкоголь'),
(1, 'Закуски'),
(1, 'Доставка еды')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Транспорт" (categoryId = 2)
INSERT INTO subcategories (categoryId, name) VALUES
(2, 'Бензин'),
(2, 'Парковка'),
(2, 'Общественный транспорт'),
(2, 'Такси'),
(2, 'Ремонт авто'),
(2, 'Страховка авто')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Покупки" (categoryId = 3)
INSERT INTO subcategories (categoryId, name) VALUES
(3, 'Одежда'),
(3, 'Электроника'),
(3, 'Мебель'),
(3, 'Товары для дома'),
(3, 'Книги'),
(3, 'Подарки')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Коммунальные услуги" (categoryId = 4)
INSERT INTO subcategories (categoryId, name) VALUES
(4, 'Электричество'),
(4, 'Вода'),
(4, 'Газ'),
(4, 'Интернет'),
(4, 'Телефон'),
(4, 'Отопление')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Здоровье" (categoryId = 5)
INSERT INTO subcategories (categoryId, name) VALUES
(5, 'Аптека'),
(5, 'Врач'),
(5, 'Стоматолог'),
(5, 'Больница'),
(5, 'Страхование'),
(5, 'Фитнес')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Развлечения" (categoryId = 6)
INSERT INTO subcategories (categoryId, name) VALUES
(6, 'Кино'),
(6, 'Музыка'),
(6, 'Игры'),
(6, 'Хобби'),
(6, 'Концерты'),
(6, 'Спорт')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Образование" (categoryId = 7)
INSERT INTO subcategories (categoryId, name) VALUES
(7, 'Курсы'),
(7, 'Учебники'),
(7, 'Обучение'),
(7, 'Сертификация'),
(7, 'Мастер-классы')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Счета" (categoryId = 8)
INSERT INTO subcategories (categoryId, name) VALUES
(8, 'Кредитная карта'),
(8, 'Кредит'),
(8, 'Аренда'),
(8, 'Подписки'),
(8, 'Услуги')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Личное" (categoryId = 9)
INSERT INTO subcategories (categoryId, name) VALUES
(9, 'Стрижка'),
(9, 'Красота'),
(9, 'Стирка'),
(9, 'Уборка')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить подкатегории для "Путешествия" (categoryId = 10)
INSERT INTO subcategories (categoryId, name) VALUES
(10, 'Отель'),
(10, 'Авиабилеты'),
(10, 'Поезд'),
(10, 'Отдых')
ON DUPLICATE KEY UPDATE name=name;

-- Вставить системные категории для доходов
INSERT INTO categories (name, icon, isSystem) VALUES
('Зарплата', 'work', TRUE),                      -- id = 11
('Бизнес', 'store', TRUE),                       -- id = 12
('Инвестиции', 'trending-up', TRUE),             -- id = 13
('Фриланс', 'laptop', TRUE),                     -- id = 14
('Бонусы', 'stars', TRUE),                       -- id = 15
('Другое', 'more', TRUE)                         -- id = 16
ON DUPLICATE KEY UPDATE name=name;

