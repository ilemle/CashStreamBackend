-- Migration: Add legacy categories for backward compatibility
-- Date: 2025-01-27
-- Description: Добавляет категории со старыми строковыми ID для обратной совместимости
--              Это позволяет использовать старые ID типа "shopping", "food" и т.д.

-- ============================================================================
-- LEGACY CATEGORIES (для обратной совместимости со старыми ID)
-- ============================================================================

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
ON DUPLICATE KEY UPDATE nameKey=VALUES(nameKey), icon=VALUES(icon), isSystem=VALUES(isSystem);

-- Категории доходов со старыми ID
INSERT INTO categories (id, nameKey, icon, isSystem) VALUES
('salary', 'category.salary', 'work', TRUE),
('business', 'category.business', 'store', TRUE),
('investment', 'category.investment', 'trending-up', TRUE),
('freelance', 'category.freelance', 'laptop', TRUE),
('bonus', 'category.bonus', 'stars', TRUE),
('other', 'category.other', 'more', TRUE)
ON DUPLICATE KEY UPDATE nameKey=VALUES(nameKey), icon=VALUES(icon), isSystem=VALUES(isSystem);

-- Переводы для старых категорий расходов на русский
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

-- Переводы для старых категорий доходов на русский
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

