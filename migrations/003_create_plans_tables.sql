-- Migration: Create budgets and goals tables for plans feature
-- Date: 2025-10-28

-- Таблица бюджетов
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  spent DECIMAL(15, 2) DEFAULT 0,
  budget DECIMAL(15, 2) NOT NULL,
  color VARCHAR(20) NOT NULL,
  user INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user),
  INDEX idx_category (category),
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица целей
CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  target DECIMAL(15, 2) NOT NULL,
  current DECIMAL(15, 2) DEFAULT 0,
  deadline DATE NOT NULL,
  user INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user),
  INDEX idx_deadline (deadline),
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
);

