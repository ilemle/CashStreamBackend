-- Добавление поля lastTelegramActivity в таблицу users для отслеживания последней активности в Telegram
ALTER TABLE users ADD COLUMN lastTelegramActivity TIMESTAMP NULL AFTER telegramId;
CREATE INDEX idx_last_telegram_activity ON users(lastTelegramActivity);

