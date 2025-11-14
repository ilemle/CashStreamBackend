# Схема базы данных CashStream

## 📊 Обзор таблиц

| Таблица | Описание | Связи |
|---------|----------|-------|
| `users` | Пользователи системы | - |
| `operations` | Финансовые операции | → users, categories, subcategories |
| `categories` | Категории операций | → users |
| `subcategories` | Подкатегории | → categories |
| `budgets` | Бюджеты по категориям | → users, categories |
| `goals` | Финансовые цели | → users |
| `debts` | Долги | → users |
| `email_verifications` | Коды верификации email | - |
| `phone_verifications` | Коды верификации телефона | - |
| `telegram_auth_sessions` | Сессии Telegram авторизации | → users |

---

## 📋 Детальные схемы таблиц

### 1. users

**Описание**: Пользователи системы

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | CHAR(36) | UUID пользователя | PRIMARY KEY |
| `username` | VARCHAR(255) | Имя пользователя | NOT NULL, UNIQUE |
| `email` | VARCHAR(255) | Email | UNIQUE, NULL |
| `phone` | VARCHAR(20) | Телефон | UNIQUE, NULL |
| `telegramId` | BIGINT | ID Telegram | UNIQUE, NULL |
| `lastTelegramActivity` | TIMESTAMP | Последняя активность в Telegram | NULL |
| `password_hash` | VARCHAR(255) | Хеш пароля | NOT NULL |
| `created_at` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Дата обновления | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Индексы**:
- PRIMARY KEY (`id`)
- UNIQUE (`username`)
- UNIQUE (`email`)
- UNIQUE (`phone`)
- UNIQUE (`telegramId`)

---

### 2. operations

**Описание**: Финансовые операции (доходы, расходы, переводы)

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | CHAR(36) | UUID операции | PRIMARY KEY |
| `userId` | CHAR(36) | ID пользователя | NOT NULL, FK → users.id |
| `title` | VARCHAR(255) | Название операции | NULL |
| `type` | ENUM | Тип операции | NOT NULL ('income', 'expense', 'transfer') |
| `amount` | DECIMAL(15,2) | Сумма | NOT NULL |
| `currency` | VARCHAR(10) | Валюта | DEFAULT 'RUB' |
| `categoryId` | VARCHAR(36) | ID категории | NULL, FK → categories.id |
| `subcategoryId` | VARCHAR(36) | ID подкатегории | NULL, FK → subcategories.id |
| `description` | VARCHAR(255) | Описание (legacy, не используется) | NULL |
| `fromAccount` | VARCHAR(255) | Счет-источник (для переводов) | NULL |
| `toAccount` | VARCHAR(255) | Счет-получатель (для переводов) | NULL |
| `date` | TIMESTAMP | Дата операции | DEFAULT CURRENT_TIMESTAMP |
| `timestamp` | BIGINT | Unix timestamp | NULL |
| `created_at` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | Дата обновления | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`userId`)
- INDEX (`type`)
- INDEX (`date`)
- INDEX (`categoryId`)
- INDEX (`subcategoryId`)
- FOREIGN KEY (`userId`) → `users(id)` ON DELETE CASCADE
- FOREIGN KEY (`categoryId`) → `categories(id)` ON DELETE SET NULL
- FOREIGN KEY (`subcategoryId`) → `subcategories(id)` ON DELETE SET NULL

**Примечание**: Названия категорий получаются через JOIN при запросах. Поле `category` в ответах API вычисляется как "Категория > Подкатегория" или просто "Категория".

**Типы операций**:
- `income` - Доход
- `expense` - Расход
- `transfer` - Перевод между счетами

---

### 3. categories

**Описание**: Категории операций (системные и пользовательские)

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID категории | PRIMARY KEY |
| `name` | VARCHAR(255) | Название | NOT NULL |
| `icon` | VARCHAR(100) | Иконка | NULL |
| `isSystem` | BOOLEAN | Системная категория | DEFAULT FALSE |
| `userId` | VARCHAR(36) | ID пользователя (NULL для системных) | NULL, FK → users.id |
| `createdAt` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`userId`)
- INDEX (`isSystem`)
- FOREIGN KEY (`userId`) → `users(id)` ON DELETE CASCADE

---

### 4. subcategories

**Описание**: Подкатегории операций

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID подкатегории | PRIMARY KEY |
| `categoryId` | VARCHAR(36) | ID категории | NOT NULL, FK → categories.id |
| `name` | VARCHAR(255) | Название | NOT NULL |
| `icon` | VARCHAR(100) | Иконка | NULL |
| `createdAt` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`categoryId`)
- FOREIGN KEY (`categoryId`) → `categories(id)` ON DELETE CASCADE

---

### 5. budgets

**Описание**: Бюджеты по категориям

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID бюджета | PRIMARY KEY |
| `categoryId` | VARCHAR(36) | ID категории | NOT NULL, FK → categories.id |
| `category` | VARCHAR(255) | Название категории (кэш) | NOT NULL |
| `spent` | DECIMAL(15,2) | Потрачено | DEFAULT 0 |
| `budget` | DECIMAL(15,2) | Бюджет | NOT NULL |
| `color` | VARCHAR(20) | Цвет | NOT NULL |
| `userId` | VARCHAR(36) | ID пользователя | NOT NULL, FK → users.id |
| `createdAt` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |
| `updatedAt` | TIMESTAMP | Дата обновления | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`userId`)
- INDEX (`categoryId`)
- INDEX (`category`)
- FOREIGN KEY (`userId`) → `users(id)` ON DELETE CASCADE
- FOREIGN KEY (`categoryId`) → `categories(id)` ON DELETE CASCADE

**Примечание**: Поле `category` хранится как кэш названия категории для быстрого доступа без JOIN. При изменении названия категории нужно обновить все связанные бюджеты.

---

### 6. goals

**Описание**: Финансовые цели

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID цели | PRIMARY KEY |
| `title` | VARCHAR(255) | Название | NOT NULL |
| `target` | DECIMAL(15,2) | Целевая сумма | NOT NULL |
| `current` | DECIMAL(15,2) | Текущая сумма | DEFAULT 0 |
| `deadline` | DATE | Срок | NOT NULL |
| `userId` | VARCHAR(36) | ID пользователя | NOT NULL, FK → users.id |
| `autoFill` | BOOLEAN | Автопополнение | DEFAULT FALSE |
| `autoFillPercentage` | DECIMAL(5,2) | Процент автопополнения | NULL |
| `createdAt` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |
| `updatedAt` | TIMESTAMP | Дата обновления | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`userId`)
- INDEX (`deadline`)
- FOREIGN KEY (`userId`) → `users(id)` ON DELETE CASCADE

---

### 7. debts

**Описание**: Долги (я одолжил / я взял в долг)

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID долга | PRIMARY KEY |
| `title` | VARCHAR(255) | Название | NOT NULL |
| `amount` | DECIMAL(15,2) | Сумма | NOT NULL |
| `currency` | VARCHAR(10) | Валюта | DEFAULT 'RUB' |
| `type` | ENUM | Тип долга | NOT NULL ('lent', 'borrowed') |
| `person` | VARCHAR(255) | Имя человека/организации | NOT NULL |
| `dueDate` | DATE | Дата возврата | NOT NULL |
| `isPaid` | BOOLEAN | Оплачен | DEFAULT FALSE |
| `paidDate` | DATE | Дата оплаты | NULL |
| `userId` | VARCHAR(36) | ID пользователя | NOT NULL, FK → users.id |
| `createdAt` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |
| `updatedAt` | TIMESTAMP | Дата обновления | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`userId`)
- INDEX (`isPaid`)
- INDEX (`dueDate`)
- INDEX (`type`)
- FOREIGN KEY (`userId`) → `users(id)` ON DELETE CASCADE

**Типы долгов**:
- `lent` - Я одолжил (мне должны)
- `borrowed` - Я взял в долг (я должен)

---

### 8. email_verifications

**Описание**: Коды верификации email

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID записи | PRIMARY KEY |
| `email` | VARCHAR(255) | Email | NOT NULL |
| `code` | VARCHAR(6) | Код верификации | NOT NULL |
| `expiresAt` | DATETIME | Срок действия | NOT NULL |
| `verified` | BOOLEAN | Верифицирован | DEFAULT FALSE |
| `createdAt` | DATETIME | Дата создания | DEFAULT CURRENT_TIMESTAMP |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`email`)
- INDEX (`code`)
- INDEX (`expiresAt`)

---

### 9. phone_verifications

**Описание**: Коды верификации телефона

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | VARCHAR(36) | ID записи | PRIMARY KEY |
| `phone` | VARCHAR(20) | Телефон | NOT NULL |
| `code` | VARCHAR(6) | Код верификации | NOT NULL |
| `expiresAt` | DATETIME | Срок действия | NOT NULL |
| `verified` | BOOLEAN | Верифицирован | DEFAULT FALSE |
| `createdAt` | DATETIME | Дата создания | DEFAULT CURRENT_TIMESTAMP |

**Индексы**:
- PRIMARY KEY (`id`)
- INDEX (`phone`)
- INDEX (`code`)
- INDEX (`expiresAt`)

---

### 10. telegram_auth_sessions

**Описание**: Сессии авторизации через Telegram

| Поле | Тип | Описание | Ограничения |
|------|-----|----------|-------------|
| `id` | CHAR(36) | ID сессии | PRIMARY KEY |
| `sessionToken` | VARCHAR(255) | Токен сессии | NOT NULL, UNIQUE |
| `telegramId` | BIGINT | ID Telegram | NOT NULL |
| `userId` | CHAR(36) | ID пользователя | NULL, FK → users.id |
| `createdAt` | TIMESTAMP | Дата создания | DEFAULT CURRENT_TIMESTAMP |
| `expiresAt` | TIMESTAMP | Срок действия | NOT NULL |
| `used` | BOOLEAN | Использована | DEFAULT FALSE |

**Индексы**:
- PRIMARY KEY (`id`)
- UNIQUE (`sessionToken`)
- INDEX (`telegramId`)
- INDEX (`expiresAt`)
- FOREIGN KEY (`userId`) → `users(id)` ON DELETE CASCADE

---

## 🔗 Связи между таблицами

```
users (1) ──┬── (N) operations
            ├── (N) categories
            ├── (N) budgets
            ├── (N) goals
            ├── (N) debts
            └── (N) telegram_auth_sessions

categories (1) ── (N) subcategories
operations (N) ── (0..1) categories (через categoryId)
operations (N) ── (0..1) subcategories (через subcategoryId)
```

---

## 📝 Примечания

1. **Legacy поля**: В таблице `operations` есть поля `categoryId`, `subcategoryId`, `description`, которые являются устаревшими. Используются новые поля `category`, `categoryKey`.

2. **Типы операций**: ENUM `type` в таблице `operations` поддерживает три значения: 'income', 'expense', 'transfer'.

3. **Валюты**: По умолчанию используется 'RUB'. Поддерживаются другие валюты через поле `currency`.

4. **Каскадное удаление**: При удалении пользователя удаляются все связанные данные (операции, бюджеты, цели, долги).

5. **Системные категории**: Категории с `isSystem = TRUE` принадлежат всем пользователям и не могут быть удалены.

