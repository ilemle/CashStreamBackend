-- Migration: Add auto-fill fields to goals table
-- Date: 2025-10-28

-- Добавляем поля автопополнения к таблице целей
ALTER TABLE goals 
ADD COLUMN autoFill BOOLEAN DEFAULT FALSE,
ADD COLUMN autoFillPercentage DECIMAL(5, 2) DEFAULT NULL;

-- Комментарии для полей
-- autoFill: Включено ли автоматическое пополнение цели
-- autoFillPercentage: Процент от доходов, который идет на цель (например, 10.00 = 10%)

