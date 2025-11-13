-- Migration: Add 'transfer' to operations type ENUM
-- Date: 2025-01-27

ALTER TABLE operations 
MODIFY COLUMN type ENUM('income', 'expense', 'transfer') NOT NULL;

