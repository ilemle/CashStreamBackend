-- Migration: Create operations table
-- Date: 2025-11-13

CREATE TABLE IF NOT EXISTS operations (
  id CHAR(36) PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  categoryId VARCHAR(36) NULL,
  subcategoryId VARCHAR(36) NULL,
  description VARCHAR(255) NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_type (type),
  INDEX idx_date (date),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL
);
