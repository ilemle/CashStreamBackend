-- Migration: Create debts table
-- Date: 2024

-- Таблица долгов
CREATE TABLE IF NOT EXISTS debts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  type ENUM('lent', 'borrowed') NOT NULL COMMENT 'lent - я одолжил, borrowed - я взял в долг',
  person VARCHAR(255) NOT NULL COMMENT 'Имя человека/организации',
  dueDate DATE NOT NULL COMMENT 'Дата возврата',
  isPaid BOOLEAN DEFAULT FALSE,
  paidDate DATE NULL,
  userId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_isPaid (isPaid),
  INDEX idx_dueDate (dueDate),
  INDEX idx_type (type),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

