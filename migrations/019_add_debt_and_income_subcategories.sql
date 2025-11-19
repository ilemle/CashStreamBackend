-- ============================================================================
-- Migration: 019_add_debt_and_income_subcategories.sql
-- Description: Add debt category and subcategories for debts and income sources
-- Date: 2025-11-19
-- ============================================================================

-- Добавляем категорию "Долги"
INSERT INTO categories (id, nameKey, icon, color, type, isSystem) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'category.debts', 'account-balance', '#FF8A65', 'expense', TRUE),
('debts', 'category.debts', 'account-balance', '#FF8A65', 'expense', TRUE)
ON DUPLICATE KEY UPDATE nameKey=VALUES(nameKey), type=VALUES(type), color=VALUES(color);

-- Переводы категории "Долги" на русский и английский
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440017', 'ru', 'Долги'),
(UUID(), 'category', '550e8400-e29b-41d4-a716-446655440017', 'en', 'Debts'),
(UUID(), 'category', 'debts', 'ru', 'Долги'),
(UUID(), 'category', 'debts', 'en', 'Debts')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================================
-- ПОДКАТЕГОРИИ ДЛЯ ДОЛГОВ
-- ============================================================================

-- Подкатегории для расходов (дал в долг)
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440017', 'subcategory.lent_money'),
('660e8400-e29b-41d4-a716-446655440101', 'debts', 'subcategory.lent_money')
ON DUPLICATE KEY UPDATE id=id;

-- Переводы подкатегорий расходов для долгов
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440100', 'ru', 'Дал в долг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440100', 'en', 'Lent Money'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440101', 'ru', 'Дал в долг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440101', 'en', 'Lent Money')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================================
-- ПОДКАТЕГОРИИ ДЛЯ ДОХОДОВ
-- ============================================================================

-- Подкатегории для зарплаты
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440011', 'subcategory.main_salary'),
('660e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440011', 'subcategory.overtime'),
('660e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440011', 'subcategory.bonus_pay'),
('660e8400-e29b-41d4-a716-446655440105', 'salary', 'subcategory.main_salary'),
('660e8400-e29b-41d4-a716-446655440106', 'salary', 'subcategory.overtime'),
('660e8400-e29b-41d4-a716-446655440107', 'salary', 'subcategory.bonus_pay')
ON DUPLICATE KEY UPDATE id=id;

-- Подкатегории для бизнеса
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440012', 'subcategory.product_sales'),
('660e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440012', 'subcategory.service_income'),
('660e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440012', 'subcategory.business_profit'),
('660e8400-e29b-41d4-a716-446655440111', 'business', 'subcategory.product_sales'),
('660e8400-e29b-41d4-a716-446655440112', 'business', 'subcategory.service_income'),
('660e8400-e29b-41d4-a716-446655440113', 'business', 'subcategory.business_profit')
ON DUPLICATE KEY UPDATE id=id;

-- Подкатегории для инвестиций
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440013', 'subcategory.dividends'),
('660e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440013', 'subcategory.capital_gains'),
('660e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440013', 'subcategory.interest_income'),
('660e8400-e29b-41d4-a716-446655440117', 'investment', 'subcategory.dividends'),
('660e8400-e29b-41d4-a716-446655440118', 'investment', 'subcategory.capital_gains'),
('660e8400-e29b-41d4-a716-446655440119', 'investment', 'subcategory.interest_income')
ON DUPLICATE KEY UPDATE id=id;

-- Подкатегории для фриланса
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440014', 'subcategory.web_development'),
('660e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440014', 'subcategory.design'),
('660e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440014', 'subcategory.consulting'),
('660e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440014', 'subcategory.writing'),
('660e8400-e29b-41d4-a716-446655440124', 'freelance', 'subcategory.web_development'),
('660e8400-e29b-41d4-a716-446655440125', 'freelance', 'subcategory.design'),
('660e8400-e29b-41d4-a716-446655440126', 'freelance', 'subcategory.consulting'),
('660e8400-e29b-41d4-a716-446655440127', 'freelance', 'subcategory.writing')
ON DUPLICATE KEY UPDATE id=id;

-- Подкатегории для бонусов
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440128', '550e8400-e29b-41d4-a716-446655440015', 'subcategory.performance_bonus'),
('660e8400-e29b-41d4-a716-446655440129', '550e8400-e29b-41d4-a716-446655440015', 'subcategory.year_end_bonus'),
('660e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440015', 'subcategory.commission'),
('660e8400-e29b-41d4-a716-446655440131', 'bonus', 'subcategory.performance_bonus'),
('660e8400-e29b-41d4-a716-446655440132', 'bonus', 'subcategory.year_end_bonus'),
('660e8400-e29b-41d4-a716-446655440133', 'bonus', 'subcategory.commission')
ON DUPLICATE KEY UPDATE id=id;

-- Подкатегории для "Другое" доходы
INSERT INTO subcategories (id, categoryId, nameKey) VALUES
('660e8400-e29b-41d4-a716-446655440134', '550e8400-e29b-41d4-a716-446655440016', 'subcategory.gifts'),
('660e8400-e29b-41d4-a716-446655440135', '550e8400-e29b-41d4-a716-446655440016', 'subcategory.refunds'),
('660e8400-e29b-41d4-a716-446655440136', '550e8400-e29b-41d4-a716-446655440016', 'subcategory.found_money'),
('660e8400-e29b-41d4-a716-446655440137', '550e8400-e29b-41d4-a716-446655440016', 'subcategory.prize_winnings'),
('660e8400-e29b-41d4-a716-446655440138', 'other', 'subcategory.gifts'),
('660e8400-e29b-41d4-a716-446655440139', 'other', 'subcategory.refunds'),
('660e8400-e29b-41d4-a716-446655440140', 'other', 'subcategory.found_money'),
('660e8400-e29b-41d4-a716-446655440141', 'other', 'subcategory.prize_winnings')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================================================
-- ПЕРЕВОДЫ ПОДКАТЕГОРИЙ ДОХОДОВ НА РУССКИЙ
-- ============================================================================

-- Переводы подкатегорий зарплаты
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440102', 'ru', 'Основная зарплата'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440103', 'ru', 'Сверхурочные'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440104', 'ru', 'Премия'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440105', 'ru', 'Основная зарплата'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440106', 'ru', 'Сверхурочные'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440107', 'ru', 'Премия')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий бизнеса
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440108', 'ru', 'Продажа товаров'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440109', 'ru', 'Доход от услуг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440110', 'ru', 'Прибыль бизнеса'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440111', 'ru', 'Продажа товаров'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440112', 'ru', 'Доход от услуг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440113', 'ru', 'Прибыль бизнеса')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий инвестиций
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440114', 'ru', 'Дивиденды'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440115', 'ru', 'Доход от продажи активов'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440116', 'ru', 'Проценты по вкладам'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440117', 'ru', 'Дивиденды'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440118', 'ru', 'Доход от продажи активов'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440119', 'ru', 'Проценты по вкладам')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий фриланса
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440120', 'ru', 'Веб-разработка'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440121', 'ru', 'Дизайн'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440122', 'ru', 'Консалтинг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440123', 'ru', 'Копирайтинг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440124', 'ru', 'Веб-разработка'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440125', 'ru', 'Дизайн'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440126', 'ru', 'Консалтинг'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440127', 'ru', 'Копирайтинг')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий бонусов
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440128', 'ru', 'Премия за эффективность'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440129', 'ru', 'Годовая премия'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440130', 'ru', 'Комиссионные'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440131', 'ru', 'Премия за эффективность'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440132', 'ru', 'Годовая премия'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440133', 'ru', 'Комиссионные')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий "Другое" доходы
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440134', 'ru', 'Подарки'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440135', 'ru', 'Возвраты'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440136', 'ru', 'Найденные деньги'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440137', 'ru', 'Выигрыши'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440138', 'ru', 'Подарки'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440139', 'ru', 'Возвраты'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440140', 'ru', 'Найденные деньги'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440141', 'ru', 'Выигрыши')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================================
-- ПЕРЕВОДЫ ПОДКАТЕГОРИЙ ДОХОДОВ НА АНГЛИЙСКИЙ
-- ============================================================================

-- Переводы подкатегорий зарплаты
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440102', 'en', 'Main Salary'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440103', 'en', 'Overtime'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440104', 'en', 'Bonus Pay'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440105', 'en', 'Main Salary'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440106', 'en', 'Overtime'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440107', 'en', 'Bonus Pay')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий бизнеса
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440108', 'en', 'Product Sales'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440109', 'en', 'Service Income'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440110', 'en', 'Business Profit'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440111', 'en', 'Product Sales'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440112', 'en', 'Service Income'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440113', 'en', 'Business Profit')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий инвестиций
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440114', 'en', 'Dividends'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440115', 'en', 'Capital Gains'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440116', 'en', 'Interest Income'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440117', 'en', 'Dividends'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440118', 'en', 'Capital Gains'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440119', 'en', 'Interest Income')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий фриланса
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440120', 'en', 'Web Development'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440121', 'en', 'Design'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440122', 'en', 'Consulting'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440123', 'en', 'Writing'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440124', 'en', 'Web Development'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440125', 'en', 'Design'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440126', 'en', 'Consulting'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440127', 'en', 'Writing')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий бонусов
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440128', 'en', 'Performance Bonus'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440129', 'en', 'Year-End Bonus'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440130', 'en', 'Commission'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440131', 'en', 'Performance Bonus'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440132', 'en', 'Year-End Bonus'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440133', 'en', 'Commission')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Переводы подкатегорий "Другое" доходы
INSERT INTO translations (id, entityType, entityId, language, name) VALUES
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440134', 'en', 'Gifts'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440135', 'en', 'Refunds'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440136', 'en', 'Found Money'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440137', 'en', 'Prize Winnings'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440138', 'en', 'Gifts'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440139', 'en', 'Refunds'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440140', 'en', 'Found Money'),
(UUID(), 'subcategory', '660e8400-e29b-41d4-a716-446655440141', 'en', 'Prize Winnings')
ON DUPLICATE KEY UPDATE name=VALUES(name);
