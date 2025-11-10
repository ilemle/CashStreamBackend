-- Добавление поля telegramId в таблицу users
-- Проверяем, существует ли уже поле telegramId
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'telegramId'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN telegramId BIGINT NULL AFTER phone',
  'SELECT "Column telegramId already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем, существует ли уже индекс
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_telegram_id'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE users ADD UNIQUE INDEX idx_telegram_id (telegramId)',
  'SELECT "Index idx_telegram_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

