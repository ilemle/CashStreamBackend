-- Migration: Initial database schema with multilingual support
-- Date: 2025-01-27
-- Description: Объединенная миграция для создания всей структуры БД с мультиязычностью
--              Категории и подкатегории используют UUID и таблицу translations

-- ============================================================================
-- SET DATABASE ENCODING
-- ============================================================================
-- Устанавливаем кодировку для всей базы данных и соединения
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE NULL,
  phone VARCHAR(20) UNIQUE NULL,
  telegramId BIGINT UNIQUE NULL,
  lastTelegramActivity TIMESTAMP NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_telegram_id (telegramId),
  INDEX idx_last_telegram_activity (lastTelegramActivity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CATEGORIES TABLES (with multilingual support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) PRIMARY KEY, -- UUID для уникальности
  nameKey VARCHAR(255) NOT NULL UNIQUE, -- Уникальный ключ для переводов (например, 'category.food')
  icon VARCHAR(100),
  isSystem BOOLEAN DEFAULT FALSE,
  userId VARCHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_system (isSystem),
  INDEX idx_nameKey (nameKey),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subcategories (
  id CHAR(36) PRIMARY KEY, -- UUID для уникальности
  categoryId CHAR(36) NOT NULL,
  nameKey VARCHAR(255) NOT NULL UNIQUE, -- Уникальный ключ для переводов (например, 'subcategory.groceries')
  icon VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (categoryId),
  INDEX idx_nameKey (nameKey),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRANSLATIONS TABLE (for multilingual support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS translations (
  id CHAR(36) PRIMARY KEY,
  entityType ENUM('category', 'subcategory') NOT NULL,
  entityId CHAR(36) NOT NULL, -- ID категории или подкатегории
  language VARCHAR(10) NOT NULL, -- ISO 639-1 код языка (ru, en, etc.)
  name VARCHAR(255) NOT NULL, -- Переведенное название
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_translation (entityType, entityId, language),
  INDEX idx_entity (entityType, entityId),
  INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- OPERATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS operations (
  id CHAR(36) PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  title VARCHAR(255) NULL,
  type ENUM('income', 'expense', 'transfer') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  categoryId VARCHAR(36) NULL,
  subcategoryId VARCHAR(36) NULL,
  description VARCHAR(255) NULL,
  fromAccount VARCHAR(255) NULL,
  toAccount VARCHAR(255) NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  timestamp BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_type (type),
  INDEX idx_date (date),
  INDEX idx_categoryId (categoryId),
  INDEX idx_subcategoryId (subcategoryId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  categoryId VARCHAR(36) NOT NULL,
  category VARCHAR(255) NOT NULL,
  spent DECIMAL(15, 2) DEFAULT 0,
  budget DECIMAL(15, 2) NOT NULL,
  color VARCHAR(20) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_categoryId (categoryId),
  INDEX idx_category (category),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GOALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  target DECIMAL(15, 2) NOT NULL,
  current DECIMAL(15, 2) DEFAULT 0,
  deadline DATE NOT NULL,
  userId VARCHAR(36) NOT NULL,
  autoFill BOOLEAN DEFAULT FALSE,
  autoFillPercentage DECIMAL(5, 2) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_deadline (deadline),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DEBTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS debts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  type ENUM('lent', 'borrowed') NOT NULL COMMENT 'lent - я одолжил, borrowed - я взял в долг',
  person VARCHAR(255) NOT NULL COMMENT 'Имя человека/организации',
  dueDate DATE NOT NULL COMMENT 'Дата возврата',
  isPaid BOOLEAN DEFAULT FALSE,
  paidDate DATE NULL,
  userId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_isPaid (isPaid),
  INDEX idx_dueDate (dueDate),
  INDEX idx_type (type),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EMAIL VERIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expiresAt DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_code (code),
  INDEX idx_expiresAt (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PHONE VERIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS phone_verifications (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expiresAt DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_code (code),
  INDEX idx_expiresAt (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TELEGRAM AUTH SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_auth_sessions (
  id CHAR(36) PRIMARY KEY,
  sessionToken VARCHAR(255) NOT NULL UNIQUE,
  telegramId BIGINT NOT NULL,
  userId CHAR(36) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  INDEX idx_session_token (sessionToken),
  INDEX idx_telegram_id (telegramId),
  INDEX idx_expires_at (expiresAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SYSTEM CATEGORIES (with UUID and translations)
-- ============================================================================

-- Системные категории для расходов
INSERT INTO categories (id, nameKey, icon, isSystem) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'category.food', 'restaurant', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'category.transport', 'directions-car', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'category.shopping', 'shopping-cart', TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'category.utilities', 'home', TRUE),
('550e8400-e29b-41d4-a716-446655440005', 'category.health', 'favorite', TRUE),
('550e8400-e29b-41d4-a716-446655440006', 'category.entertainment', 'sports-esports', TRUE),
('550e8400-e29b-41d4-a716-446655440007', 'category.education', 'school', TRUE),
('550e8400-e29b-41d4-a716-446655440008', 'category.bills', 'receipt', TRUE),
('550e8400-e29b-41d4-a716-446655440009', 'category.personal', 'person', TRUE),
('550e8400-e29b-41d4-a716-446655440010', 'category.travel', 'flight', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Переводы категорий на русский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440001', 'ru', 'Еда и напитки'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440002', 'ru', 'Транспорт'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440003', 'ru', 'Покупки'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440004', 'ru', 'Коммунальные услуги'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440005', 'ru', 'Здоровье'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440006', 'ru', 'Развлечения'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440007', 'ru', 'Образование'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440008', 'ru', 'Счета'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440009', 'ru', 'Личное'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440010', 'ru', 'Путешествия')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы категорий на английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440001', 'en', 'Food & Drinks'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440002', 'en', 'Transport'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440003', 'en', 'Shopping'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440004', 'en', 'Utilities'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440005', 'en', 'Health'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440006', 'en', 'Entertainment'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440007', 'en', 'Education'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440008', 'en', 'Bills'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440009', 'en', 'Personal'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440010', 'en', 'Travel')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Системные категории для доходов
INSERT INTO categories (id, nameKey, icon, isSystem) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'category.salary', 'work', TRUE),
('550e8400-e29b-41d4-a716-446655440012', 'category.business', 'store', TRUE),
('550e8400-e29b-41d4-a716-446655440013', 'category.investment', 'trending-up', TRUE),
('550e8400-e29b-41d4-a716-446655440014', 'category.freelance', 'laptop', TRUE),
('550e8400-e29b-41d4-a716-446655440015', 'category.bonus', 'stars', TRUE),
('550e8400-e29b-41d4-a716-446655440016', 'category.other', 'more', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Переводы категорий доходов на русский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440011', 'ru', 'Зарплата'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440012', 'ru', 'Бизнес'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440013', 'ru', 'Инвестиции'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440014', 'ru', 'Фриланс'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440015', 'ru', 'Бонусы'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440016', 'ru', 'Другое')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы категорий доходов на английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440011', 'en', 'Salary'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440012', 'en', 'Business'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440013', 'en', 'Investment'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440014', 'en', 'Freelance'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440015', 'en', 'Bonus'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440016', 'en', 'Other')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================================
-- LEGACY CATEGORIES (для обратной совместимости со старыми ID)
-- ============================================================================
-- Добавляем категории со старыми строковыми ID для обратной совместимости
-- Эти категории ссылаются на те же UUID категории через nameKey

-- Категории расходов со старыми ID
INSERT INTO categories (id, nameKey, icon, isSystem) VALUES
('food', 'category.food', 'restaurant', TRUE),
('transport', 'category.transport', 'directions-car', TRUE),
('shopping', 'category.shopping', 'shopping-cart', TRUE),
('utilities', 'category.utilities', 'home', TRUE),
('health', 'category.health', 'favorite', TRUE),
('entertainment', 'category.entertainment', 'sports-esports', TRUE),
('education', 'category.education', 'school', TRUE),
('bills', 'category.bills', 'receipt', TRUE),
('personal', 'category.personal', 'person', TRUE),
('travel', 'category.travel', 'flight', TRUE)
ON DUPLICATE KEY UPDATE nameKey=VALUES(nameKey);

-- Категории доходов со старыми ID
INSERT INTO categories (id, nameKey, icon, isSystem) VALUES
('salary', 'category.salary', 'work', TRUE),
('business', 'category.business', 'store', TRUE),
('investment', 'category.investment', 'trending-up', TRUE),
('freelance', 'category.freelance', 'laptop', TRUE),
('bonus', 'category.bonus', 'stars', TRUE),
('other', 'category.other', 'more', TRUE)
ON DUPLICATE KEY UPDATE nameKey=VALUES(nameKey);

-- Переводы для старых категорий расходов
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', 'food', 'ru', 'Еда и напитки'),
(UUID(), 'category', 'transport', 'ru', 'Транспорт'),
(UUID(), 'category', 'shopping', 'ru', 'Покупки'),
(UUID(), 'category', 'utilities', 'ru', 'Коммунальные услуги'),
(UUID(), 'category', 'health', 'ru', 'Здоровье'),
(UUID(), 'category', 'entertainment', 'ru', 'Развлечения'),
(UUID(), 'category', 'education', 'ru', 'Образование'),
(UUID(), 'category', 'bills', 'ru', 'Счета'),
(UUID(), 'category', 'personal', 'ru', 'Личное'),
(UUID(), 'category', 'travel', 'ru', 'Путешествия')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы для старых категорий доходов
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', 'salary', 'ru', 'Зарплата'),
(UUID(), 'category', 'business', 'ru', 'Бизнес'),
(UUID(), 'category', 'investment', 'ru', 'Инвестиции'),
(UUID(), 'category', 'freelance', 'ru', 'Фриланс'),
(UUID(), 'category', 'bonus', 'ru', 'Бонусы'),
(UUID(), 'category', 'other', 'ru', 'Другое')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы для старых категорий расходов на английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', 'food', 'en', 'Food & Drinks'),
(UUID(), 'category', 'transport', 'en', 'Transport'),
(UUID(), 'category', 'shopping', 'en', 'Shopping'),
(UUID(), 'category', 'utilities', 'en', 'Utilities'),
(UUID(), 'category', 'health', 'en', 'Health'),
(UUID(), 'category', 'entertainment', 'en', 'Entertainment'),
(UUID(), 'category', 'education', 'en', 'Education'),
(UUID(), 'category', 'bills', 'en', 'Bills'),
(UUID(), 'category', 'personal', 'en', 'Personal'),
(UUID(), 'category', 'travel', 'en', 'Travel')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы для старых категорий доходов на английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', 'salary', 'en', 'Salary'),
(UUID(), 'category', 'business', 'en', 'Business'),
(UUID(), 'category', 'investment', 'en', 'Investment'),
(UUID(), 'category', 'freelance', 'en', 'Freelance'),
(UUID(), 'category', 'bonus', 'en', 'Bonus'),
(UUID(), 'category', 'other', 'en', 'Other')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================================
-- SYSTEM SUBCATEGORIES (with UUID and translations)
-- ============================================================================

-- Подкатегории для "Еда и напитки"
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'subcategory.groceries'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'subcategory.restaurant'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'subcategory.cafe'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'subcategory.alcohol'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'subcategory.snacks'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'subcategory.delivery')
ON DUPLICATE KEY UPDATE id=id;

-- Переводы подкатегорий "Еда и напитки" на русский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440001', 'ru', 'Продукты'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440002', 'ru', 'Рестораны'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440003', 'ru', 'Кафе'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440004', 'ru', 'Алкоголь'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440005', 'ru', 'Закуски'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440006', 'ru', 'Доставка еды')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий "Еда и напитки" на английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440001', 'en', 'Groceries'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440002', 'en', 'Restaurants'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440003', 'en', 'Cafe'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440004', 'en', 'Alcohol'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440005', 'en', 'Snacks'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440006', 'en', 'Food Delivery')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Подкатегории для "Транспорт"
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'subcategory.gas'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'subcategory.parking'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'subcategory.public_transport'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'subcategory.taxi'),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'subcategory.car_repair'),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'subcategory.car_insurance')
ON DUPLICATE KEY UPDATE id=id;

-- Переводы подкатегорий "Транспорт" на русский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440007', 'ru', 'Бензин'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440008', 'ru', 'Парковка'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440009', 'ru', 'Общественный транспорт'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440010', 'ru', 'Такси'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440011', 'ru', 'Ремонт авто'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440012', 'ru', 'Страховка авто')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий "Транспорт" на английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440007', 'en', 'Gas'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440008', 'en', 'Parking'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440009', 'en', 'Public Transport'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440010', 'en', 'Taxi'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440011', 'en', 'Car Repair'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440012', 'en', 'Car Insurance')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Примечание: Для остальных подкатегорий используйте аналогичный подход
-- Можно добавить их позже или создать скрипт для генерации
