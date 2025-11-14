-- Migration: Add categoryId to budgets table
-- Date: 2025-01-27
-- Description: Добавляем categoryId в budgets для связи с categories через ID

-- Добавляем поле categoryId (NOT NULL, так как база будет пересоздана)
ALTER TABLE budgets 
ADD COLUMN categoryId VARCHAR(36) NOT NULL AFTER id;

-- Добавляем индекс для производительности
CREATE INDEX IF NOT EXISTS idx_budget_categoryId ON budgets(categoryId);

-- Добавляем внешний ключ
ALTER TABLE budgets
ADD CONSTRAINT fk_budget_category 
FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE;

