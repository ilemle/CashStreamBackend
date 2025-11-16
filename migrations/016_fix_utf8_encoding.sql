-- Migration: Fix UTF-8 encoding for all tables
-- Date: 2025-01-27
-- Description: Устанавливаем правильную кодировку utf8mb4 для всех таблиц

-- Исправляем кодировку для таблицы categories
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы subcategories
ALTER TABLE subcategories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы operations
ALTER TABLE operations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы users
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы budgets
ALTER TABLE budgets CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы goals
ALTER TABLE goals CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы debts
ALTER TABLE debts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Исправляем кодировку для таблицы translations
ALTER TABLE translations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

