/**
 * Типы данных для таблиц базы данных
 * Соответствуют структуре таблиц MySQL
 */

// ============================================================================
// USERS TABLE
// ============================================================================
export interface UserTable {
  id: string; // CHAR(36) PRIMARY KEY
  username: string; // VARCHAR(255) NOT NULL UNIQUE
  email: string | null; // VARCHAR(255) UNIQUE NULL
  phone: string | null; // VARCHAR(20) NULL
  telegramId: number | null; // BIGINT NULL
  lastTelegramActivity: Date | null; // TIMESTAMP NULL
  password_hash: string; // VARCHAR(255) NOT NULL
  created_at: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// ============================================================================
// OPERATIONS TABLE
// ============================================================================
export type OperationType = 'income' | 'expense' | 'transfer';

export interface OperationTable {
  id: string; // CHAR(36) PRIMARY KEY
  userId: string; // CHAR(36) NOT NULL
  title: string | null; // VARCHAR(255) NULL
  type: OperationType; // ENUM('income', 'expense', 'transfer') NOT NULL
  amount: number; // DECIMAL(15, 2) NOT NULL
  currency: string; // VARCHAR(10) DEFAULT 'RUB'
  categoryId: number | null; // INT NULL, FK → categories.id
  subcategoryId: string | null; // VARCHAR(36) NULL, FK → subcategories.id
  fromAccount: string | null; // VARCHAR(255) NULL (для переводов)
  toAccount: string | null; // VARCHAR(255) NULL (для переводов)
  date: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  timestamp: number | null; // BIGINT NULL
  created_at: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// ============================================================================
// CATEGORIES TABLE
// ============================================================================
export interface CategoryTable {
  id: number; // INT AUTO_INCREMENT PRIMARY KEY
  name: string; // VARCHAR(255) NOT NULL (прямое название категории)
  icon: string | null; // VARCHAR(100)
  isSystem: boolean; // BOOLEAN DEFAULT FALSE
  userId: string | null; // VARCHAR(36) (NULL для системных категорий)
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// ============================================================================
// SUBCATEGORIES TABLE
// ============================================================================
export interface SubcategoryTable {
  id: number; // INT AUTO_INCREMENT PRIMARY KEY
  categoryId: number; // INT NOT NULL (ссылка на categories.id)
  name: string; // VARCHAR(255) NOT NULL (прямое название подкатегории)
  icon: string | null; // VARCHAR(100)
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// ============================================================================
// TRANSLATIONS TABLE
// ============================================================================
export interface TranslationTable {
  id: string; // CHAR(36) PRIMARY KEY
  entityType: 'category' | 'subcategory'; // ENUM
  entityId: string; // CHAR(36) NOT NULL (ID категории или подкатегории)
  language: string; // VARCHAR(10) NOT NULL (ISO 639-1 код языка: ru, en, etc.)
  name: string; // VARCHAR(255) NOT NULL (переведенное название)
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// ============================================================================
// BUDGETS TABLE
// ============================================================================
export interface BudgetTable {
  id: string; // VARCHAR(36) PRIMARY KEY
  categoryId: number; // INT NOT NULL, FK → categories.id
  category: string; // VARCHAR(255) NOT NULL (кэш названия для быстрого доступа)
  spent: number; // DECIMAL(15, 2) DEFAULT 0
  budget: number; // DECIMAL(15, 2) NOT NULL
  color: string; // VARCHAR(20) NOT NULL
  userId: string; // VARCHAR(36) NOT NULL
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// ============================================================================
// GOALS TABLE
// ============================================================================
export interface GoalTable {
  id: string; // VARCHAR(36) PRIMARY KEY
  title: string; // VARCHAR(255) NOT NULL
  target: number; // DECIMAL(15, 2) NOT NULL
  current: number; // DECIMAL(15, 2) DEFAULT 0
  deadline: Date; // DATE NOT NULL
  userId: string; // VARCHAR(36) NOT NULL
  autoFill: boolean; // BOOLEAN DEFAULT FALSE (из миграции 004)
  autoFillPercentage: number | null; // DECIMAL(5, 2) NULL (из миграции 004)
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// ============================================================================
// DEBTS TABLE
// ============================================================================
export type DebtType = 'lent' | 'borrowed'; // lent - я одолжил, borrowed - я взял в долг

export interface DebtTable {
  id: string; // VARCHAR(36) PRIMARY KEY
  title: string; // VARCHAR(255) NOT NULL
  amount: number; // DECIMAL(15, 2) NOT NULL
  currency: string; // VARCHAR(10) DEFAULT 'RUB'
  type: DebtType; // ENUM('lent', 'borrowed') NOT NULL
  person: string; // VARCHAR(255) NOT NULL
  dueDate: Date; // DATE NOT NULL
  isPaid: boolean; // BOOLEAN DEFAULT FALSE
  paidDate: Date | null; // DATE NULL
  userId: string; // VARCHAR(36) NOT NULL
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// ============================================================================
// EMAIL_VERIFICATIONS TABLE
// ============================================================================
export interface EmailVerificationTable {
  id: string; // VARCHAR(36) PRIMARY KEY
  email: string; // VARCHAR(255) NOT NULL
  code: string; // VARCHAR(6) NOT NULL
  expiresAt: Date; // DATETIME NOT NULL
  verified: boolean; // BOOLEAN DEFAULT FALSE
  createdAt: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

// ============================================================================
// PHONE_VERIFICATIONS TABLE
// ============================================================================
export interface PhoneVerificationTable {
  id: string; // VARCHAR(36) PRIMARY KEY
  phone: string; // VARCHAR(20) NOT NULL
  code: string; // VARCHAR(6) NOT NULL
  expiresAt: Date; // DATETIME NOT NULL
  verified: boolean; // BOOLEAN DEFAULT FALSE
  createdAt: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

// ============================================================================
// TELEGRAM_AUTH_SESSIONS TABLE
// ============================================================================
export interface TelegramAuthSessionTable {
  id: string; // CHAR(36) PRIMARY KEY
  sessionToken: string; // VARCHAR(255) NOT NULL UNIQUE
  telegramId: number; // BIGINT NOT NULL
  userId: string | null; // CHAR(36) NULL
  createdAt: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  expiresAt: Date; // TIMESTAMP NOT NULL
  used: boolean; // BOOLEAN DEFAULT FALSE
}

// ============================================================================
// API и DTO типы (для запросов/ответов API)
// ============================================================================

// Операция с дополнительными полями для API (названия категорий)
export interface OperationDTO extends OperationTable {
  // Вычисляемые поля (получаются через JOIN)
  categoryName?: string;
  subcategoryName?: string;
  category?: string; // Полный путь "Категория > Подкатегория"

  // Конвертированная валюта (добавляется на уровне API)
  convertedAmount?: number;
  convertedCurrency?: string;
  convertedCurrencyCode?: string;
}

// Запрос на создание операции
export interface CreateOperationRequest {
  title: string;
  amount: number;
  categoryId?: number | null;
  subcategoryId?: string | null;
  date?: Date | string;
  timestamp?: number;
  type: OperationType;
  fromAccount?: string;
  toAccount?: string;
  currency?: string;
}

// Запрос на обновление операции
export interface UpdateOperationRequest extends Partial<CreateOperationRequest> {
  // Все поля опциональны для обновления
}

// Бюджет с дополнительными полями для API
export interface BudgetDTO extends BudgetTable {
  // Можно добавить дополнительные поля если нужно
}

// Запрос на создание бюджета
export interface CreateBudgetRequest {
  categoryId: number;
  category: string;
  spent?: number;
  budget: number;
  color: string;
}

// Запрос на обновление бюджета
export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  // Все поля опциональны для обновления
}

// ============================================================================
// UNION TYPE для всех таблиц
// ============================================================================
export type DatabaseTable =
  | UserTable
  | OperationTable
  | CategoryTable
  | SubcategoryTable
  | BudgetTable
  | GoalTable
  | DebtTable
  | EmailVerificationTable
  | PhoneVerificationTable
  | TelegramAuthSessionTable;

