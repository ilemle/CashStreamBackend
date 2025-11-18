-- ============================================================================
-- MIGRATION: Add type field to categories table
-- ============================================================================
-- Добавляет поле type (income/expense) в таблицу categories для явного
-- разделения категорий на доходы и расходы

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- Добавляем поле type в таблицу categories
ALTER TABLE categories 
ADD COLUMN type ENUM('income', 'expense') NOT NULL DEFAULT 'expense' 
AFTER icon;

-- Добавляем индекс для фильтрации по типу
ALTER TABLE categories 
ADD INDEX idx_type (type);

-- Обновляем существующие категории доходов (по nameKey)
UPDATE categories 
SET type = 'income' 
WHERE nameKey IN (
  'category.salary',
  'category.business',
  'category.investment',
  'category.freelance',
  'category.bonus',
  'category.other'
) OR id IN (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014',
  '550e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440016',
  'salary',
  'business',
  'investment',
  'freelance',
  'bonus',
  'other'
);

-- Все остальные категории остаются с type = 'expense' (значение по умолчанию)

