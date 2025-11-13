-- Migration: Add missing fields to operations table
-- Date: 2025-01-27
-- Adds: title, titleKey, category, categoryKey, fromAccount, toAccount

ALTER TABLE operations 
ADD COLUMN title VARCHAR(255) NULL AFTER userId,
ADD COLUMN titleKey VARCHAR(255) NULL AFTER title,
ADD COLUMN category VARCHAR(255) NULL AFTER titleKey,
ADD COLUMN categoryKey VARCHAR(255) NULL AFTER category,
ADD COLUMN fromAccount VARCHAR(255) NULL AFTER type,
ADD COLUMN toAccount VARCHAR(255) NULL AFTER fromAccount;

