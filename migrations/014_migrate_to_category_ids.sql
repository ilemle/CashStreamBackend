-- Migration: Migrate operations to use categoryId/subcategoryId instead of category string
-- Date: 2025-01-27
-- Description: Удаляем поля category, categoryKey, titleKey из operations
--              Используем только categoryId и subcategoryId для связи с категориями

-- Удаляем поля, которые больше не нужны
ALTER TABLE operations 
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS categoryKey,
DROP COLUMN IF EXISTS titleKey;

-- Делаем categoryId и subcategoryId NOT NULL (после заполнения данных)
-- Сначала обновим существующие записи, установив NULL для несуществующих связей
-- Затем можно будет сделать NOT NULL, если нужно

-- Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_categoryId ON operations(categoryId);
CREATE INDEX IF NOT EXISTS idx_subcategoryId ON operations(subcategoryId);

