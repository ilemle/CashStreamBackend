# API Документация CashStream

## 🔐 Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

---

## 📊 Operations API

### GET /api/operations

Получить список операций с пагинацией и фильтрацией.

**Query параметры**:
- `startDate` (string, optional) - Начальная дата (YYYY-MM-DD)
- `endDate` (string, optional) - Конечная дата (YYYY-MM-DD)
- `timezoneOffset` (number, optional) - Смещение часового пояса в минутах
- `page` (number, optional) - Номер страницы (по умолчанию: 1)
- `limit` (number, optional) - Элементов на странице (по умолчанию: 50)

**Response 200**:
```typescript
{
  success: true,
  count: 10,
  total: 100,
  page: 1,
  limit: 50,
  totalPages: 2,
  hasNextPage: true,
  hasPrevPage: false,
  data: OperationDTO[]
}
```

**Типы**:
```typescript
interface OperationDTO {
  id: string;
  title: string;
  titleKey?: string;
  amount: number;
  category: string;
  categoryKey?: string;
  date: string; // ISO 8601
  timestamp?: number;
  type: 'income' | 'expense' | 'transfer';
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  convertedCurrencyCode?: string;
}
```

---

### POST /api/operations

Создать новую операцию.

**Request Body**:
```typescript
{
  title: string;
  titleKey?: string;
  amount: number;
  category: string;
  categoryKey?: string;
  date?: string; // ISO 8601, по умолчанию текущая дата
  timestamp?: number;
  type: 'income' | 'expense' | 'transfer';
  currency?: string; // по умолчанию 'RUB'
  fromAccount?: string; // для type='transfer'
  toAccount?: string; // для type='transfer'
}
```

**Response 201**:
```typescript
{
  success: true,
  data: OperationDTO
}
```

---

### GET /api/operations/:id

Получить операцию по ID.

**Response 200**:
```typescript
{
  success: true,
  data: OperationDTO
}
```

**Response 404**:
```typescript
{
  success: false,
  message: 'Operation not found'
}
```

---

### PUT /api/operations/:id

Обновить операцию.

**Request Body** (все поля опциональны):
```typescript
{
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
  type?: 'income' | 'expense' | 'transfer';
  // ... другие поля
}
```

**Response 200**:
```typescript
{
  success: true,
  data: OperationDTO
}
```

---

### DELETE /api/operations/:id

Удалить операцию.

**Response 200**:
```typescript
{
  success: true,
  data: {}
}
```

---

### GET /api/operations/balance

Получить баланс пользователя.

**Response 200**:
```typescript
{
  success: true,
  data: {
    balance: number;
    totalOperations: number;
    convertedBalance?: number;
    convertedCurrency?: string;
    convertedCurrencyCode?: string;
  }
}
```

---

### POST /api/operations/batch

Создать несколько операций одним запросом.

**Request Body**:
```typescript
{
  operations: CreateOperationRequest[]
}
```

**Response 201**:
```typescript
{
  success: true,
  data: OperationDTO[]
}
```

---

## 🔑 Auth API

### POST /api/auth/register/send-code

Отправить код верификации на email.

**Request Body**:
```typescript
{
  email: string;
}
```

**Response 200**:
```typescript
{
  success: true,
  message: 'Verification code sent'
}
```

---

### POST /api/auth/register/verify

Верифицировать email и зарегистрировать пользователя.

**Request Body**:
```typescript
{
  email: string;
  code: string;
  username: string;
  password: string;
}
```

**Response 201**:
```typescript
{
  success: true,
  data: {
    token: string;
    user: UserDTO;
  }
}
```

---

### POST /api/auth/login

Войти в систему (по email или телефону).

**Request Body**:
```typescript
{
  email?: string;
  phone?: string;
  password: string;
}
```

**Response 200**:
```typescript
{
  success: true,
  data: {
    token: string;
    user: UserDTO;
  }
}
```

---

### GET /api/auth/me

Получить информацию о текущем пользователе.

**Response 200**:
```typescript
{
  success: true,
  data: UserDTO
}
```

**Типы**:
```typescript
interface UserDTO {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  telegramId?: number;
  created_at?: string;
}
```

---

## 💰 Budgets API

### GET /api/budgets

Получить все бюджеты пользователя.

**Response 200**:
```typescript
{
  success: true,
  data: BudgetDTO[]
}
```

**Типы**:
```typescript
interface BudgetDTO {
  id: string;
  category: string;
  spent: number;
  budget: number;
  color: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

### POST /api/budgets

Создать новый бюджет.

**Request Body**:
```typescript
{
  category: string;
  budget: number;
  color: string;
}
```

**Response 201**:
```typescript
{
  success: true,
  data: BudgetDTO
}
```

---

### PUT /api/budgets/:id

Обновить бюджет.

**Request Body**:
```typescript
{
  category?: string;
  budget?: number;
  color?: string;
  spent?: number;
}
```

---

### DELETE /api/budgets/:id

Удалить бюджет.

---

## 🎯 Goals API

### GET /api/goals

Получить все цели пользователя.

**Response 200**:
```typescript
{
  success: true,
  data: GoalDTO[]
}
```

**Типы**:
```typescript
interface GoalDTO {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string; // YYYY-MM-DD
  userId: string;
  autoFill?: boolean;
  autoFillPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

---

### POST /api/goals

Создать новую цель.

**Request Body**:
```typescript
{
  title: string;
  target: number;
  deadline: string; // YYYY-MM-DD
  autoFill?: boolean;
  autoFillPercentage?: number;
}
```

---

## 📁 Categories API

### GET /api/categories

Получить все категории (системные + пользовательские).

**Query параметры**:
- `type` (string, optional) - 'income' или 'expense'

**Response 200**:
```typescript
{
  success: true,
  data: CategoryDTO[]
}
```

**Типы**:
```typescript
interface CategoryDTO {
  id: string;
  name: string;
  icon?: string;
  isSystem: boolean;
  subcategories?: SubcategoryDTO[];
}

interface SubcategoryDTO {
  id: string;
  categoryId: string;
  name: string;
  icon?: string;
}
```

---

### POST /api/categories

Создать пользовательскую категорию.

**Request Body**:
```typescript
{
  name: string;
  icon?: string;
}
```

---

## 💳 Debts API

### GET /api/debts

Получить все долги пользователя.

**Response 200**:
```typescript
{
  success: true,
  data: DebtDTO[]
}
```

**Типы**:
```typescript
interface DebtDTO {
  id: string;
  title: string;
  amount: number;
  currency: string;
  type: 'lent' | 'borrowed';
  person: string;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  paidDate?: string; // YYYY-MM-DD
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

### POST /api/debts

Создать новый долг.

**Request Body**:
```typescript
{
  title: string;
  amount: number;
  currency?: string; // по умолчанию 'RUB'
  type: 'lent' | 'borrowed';
  person: string;
  dueDate: string; // YYYY-MM-DD
}
```

---

### GET /api/debts/overdue

Получить просроченные долги.

**Response 200**:
```typescript
{
  success: true,
  data: DebtDTO[]
}
```

---

## 💱 Currency API

### GET /api/currencies

Получить список доступных валют.

**Response 200**:
```typescript
{
  success: true,
  data: CurrencyInfo[]
}
```

**Типы**:
```typescript
interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate?: number;
}
```

---

## ⚠️ Обработка ошибок

Все ошибки возвращаются в формате:

```typescript
{
  success: false,
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

**Коды статусов**:
- `200` - Успешно
- `201` - Создано
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Внутренняя ошибка сервера

---

## 📝 Примечания

1. Все даты в формате ISO 8601 или YYYY-MM-DD
2. Все суммы в формате числа (DECIMAL в БД)
3. Валюты в формате кода (RUB, USD, EUR и т.д.)
4. JWT токен действителен до истечения срока (настраивается в `JWT_SECRET`)

