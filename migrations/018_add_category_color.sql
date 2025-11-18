-- ============================================================================
-- MIGRATION: Add color field to categories table
-- ============================================================================
-- Добавляет поле color в таблицу categories и распределяет уникальные цвета
-- для всех существующих категорий

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- Добавляем поле color в таблицу categories
ALTER TABLE categories 
ADD COLUMN color VARCHAR(7) NULL 
AFTER icon;

-- Распределяем цвета для категорий расходов (expense)
UPDATE categories 
SET color = CASE 
  WHEN nameKey = 'category.food' OR id = '550e8400-e29b-41d4-a716-446655440001' OR id = 'food' THEN '#FF6B6B'
  WHEN nameKey = 'category.transport' OR id = '550e8400-e29b-41d4-a716-446655440002' OR id = 'transport' THEN '#4ECDC4'
  WHEN nameKey = 'category.shopping' OR id = '550e8400-e29b-41d4-a716-446655440003' OR id = 'shopping' THEN '#FFE66D'
  WHEN nameKey = 'category.utilities' OR id = '550e8400-e29b-41d4-a716-446655440004' OR id = 'utilities' THEN '#95E1D3'
  WHEN nameKey = 'category.health' OR id = '550e8400-e29b-41d4-a716-446655440005' OR id = 'health' THEN '#F38181'
  WHEN nameKey = 'category.entertainment' OR id = '550e8400-e29b-41d4-a716-446655440006' OR id = 'entertainment' THEN '#AA96DA'
  WHEN nameKey = 'category.education' OR id = '550e8400-e29b-41d4-a716-446655440007' OR id = 'education' THEN '#FCBAD3'
  WHEN nameKey = 'category.bills' OR id = '550e8400-e29b-41d4-a716-446655440008' OR id = 'bills' THEN '#FFD93D'
  WHEN nameKey = 'category.personal' OR id = '550e8400-e29b-41d4-a716-446655440009' OR id = 'personal' THEN '#6BCB77'
  WHEN nameKey = 'category.travel' OR id = '550e8400-e29b-41d4-a716-446655440010' OR id = 'travel' THEN '#4D96FF'
  ELSE NULL
END
WHERE type = 'expense' AND (isSystem = TRUE OR nameKey IN (
  'category.food', 'category.transport', 'category.shopping', 'category.utilities',
  'category.health', 'category.entertainment', 'category.education', 'category.bills',
  'category.personal', 'category.travel'
));

-- Распределяем цвета для категорий доходов (income)
UPDATE categories 
SET color = CASE 
  WHEN nameKey = 'category.salary' OR id = '550e8400-e29b-41d4-a716-446655440011' OR id = 'salary' THEN '#51CF66'
  WHEN nameKey = 'category.business' OR id = '550e8400-e29b-41d4-a716-446655440012' OR id = 'business' THEN '#339AF0'
  WHEN nameKey = 'category.investment' OR id = '550e8400-e29b-41d4-a716-446655440013' OR id = 'investment' THEN '#845EF7'
  WHEN nameKey = 'category.freelance' OR id = '550e8400-e29b-41d4-a716-446655440014' OR id = 'freelance' THEN '#FF922B'
  WHEN nameKey = 'category.bonus' OR id = '550e8400-e29b-41d4-a716-446655440015' OR id = 'bonus' THEN '#FCC419'
  WHEN nameKey = 'category.other' OR id = '550e8400-e29b-41d4-a716-446655440016' OR id = 'other' THEN '#868E96'
  ELSE NULL
END
WHERE type = 'income' AND (isSystem = TRUE OR nameKey IN (
  'category.salary', 'category.business', 'category.investment', 
  'category.freelance', 'category.bonus', 'category.other'
));

-- Для пользовательских категорий без цвета устанавливаем NULL
-- (цвет будет выбран автоматически при следующем создании категории того же типа)

