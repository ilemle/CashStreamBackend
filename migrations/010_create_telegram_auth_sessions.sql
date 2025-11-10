-- Создание таблицы для временных сессий авторизации через Telegram
CREATE TABLE IF NOT EXISTS telegram_auth_sessions (
  id CHAR(36) PRIMARY KEY,
  sessionToken VARCHAR(255) NOT NULL UNIQUE,
  telegramId BIGINT NOT NULL,
  userId CHAR(36) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  INDEX idx_session_token (sessionToken),
  INDEX idx_telegram_id (telegramId),
  INDEX idx_expires_at (expiresAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

