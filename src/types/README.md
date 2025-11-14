# Типы данных CashStream Backend

## 📋 Обзор

Все типы данных организованы в трех файлах:

1. **`database.ts`** - Типы таблиц базы данных
2. **`api.ts`** - Типы для API запросов и ответов
3. **`dto.ts`** - Data Transfer Objects для передачи между слоями

---

## 🗄️ database.ts - Типы таблиц БД

Определяют структуру данных в базе данных MySQL.

### Использование:

```typescript
import { OperationTable, UserTable } from './types/database';

// В модели
class OperationModel {
  static async create(data: OperationCreateDTO): Promise<OperationTable> {
    // ...
    return operation as OperationTable;
  }
}
```

### Доступные типы:

- `UserTable` - Пользователи
- `OperationTable` - Операции
- `CategoryTable` - Категории
- `SubcategoryTable` - Подкатегории
- `BudgetTable` - Бюджеты
- `GoalTable` - Цели
- `DebtTable` - Долги
- `EmailVerificationTable` - Верификация email
- `PhoneVerificationTable` - Верификация телефона
- `TelegramAuthSessionTable` - Сессии Telegram

### Пример:

```typescript
import { OperationTable, OperationType } from './types/database';

const operation: OperationTable = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: 'user-id',
  title: 'Покупка продуктов',
  type: 'expense',
  amount: -1500.50,
  currency: 'RUB',
  category: 'Еда и напитки',
  date: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  // ...
};
```

---

## 🌐 api.ts - Типы API

Определяют структуру запросов и ответов для всех эндпоинтов API.

### Использование:

```typescript
import { 
  CreateOperationRequest,
  OperationDTO,
  GetOperationsResponse 
} from './types/api';

// В контроллере
export const createOperation = async (
  req: Request<{}, {}, CreateOperationRequest>,
  res: Response<CreateOperationResponse>
) => {
  const data: CreateOperationRequest = req.body;
  // ...
  const response: OperationDTO = { ... };
  res.json({ success: true, data: response });
};
```

### Основные типы:

#### Operations:
- `CreateOperationRequest` - Запрос создания операции
- `UpdateOperationRequest` - Запрос обновления операции
- `OperationDTO` - Операция для API
- `GetOperationsResponse` - Ответ со списком операций
- `BalanceResponse` - Ответ с балансом

#### Auth:
- `LoginRequest` - Запрос входа
- `LoginResponse` - Ответ входа
- `UserDTO` - Пользователь для API
- `RegisterVerifyRequest` - Запрос регистрации

#### Budgets:
- `CreateBudgetRequest` - Запрос создания бюджета
- `BudgetDTO` - Бюджет для API

#### Goals:
- `CreateGoalRequest` - Запрос создания цели
- `GoalDTO` - Цель для API

#### Debts:
- `CreateDebtRequest` - Запрос создания долга
- `DebtDTO` - Долг для API

### Пример:

```typescript
import { CreateOperationRequest, OperationDTO } from './types/api';

// Запрос от клиента
const request: CreateOperationRequest = {
  title: 'Покупка продуктов',
  amount: -1500,
  category: 'Еда и напитки',
  type: 'expense',
  currency: 'RUB'
};

// Ответ сервера
const response: OperationDTO = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Покупка продуктов',
  amount: -1500,
  category: 'Еда и напитки',
  type: 'expense',
  currency: 'RUB',
  date: '2025-01-27T10:30:00.000Z',
  convertedAmount: 16.50,
  convertedCurrency: '$',
  convertedCurrencyCode: 'USD'
};
```

---

## 🔄 dto.ts - Data Transfer Objects

Объекты для передачи данных между слоями приложения (Controller ↔ Model).

### Использование:

```typescript
import { OperationCreateDTO, OperationUpdateDTO } from './types/dto';

// В контроллере: преобразование Request → DTO
const dto: OperationCreateDTO = {
  ...req.body,
  userId: req.user?.id || ''
};

// В модели: использование DTO
const operation = await OperationModel.create(dto);
```

### Основные типы:

- `OperationCreateDTO` - Создание операции
- `OperationUpdateDTO` - Обновление операции
- `OperationFilterDTO` - Фильтрация операций
- `UserCreateDTO` - Создание пользователя
- `BudgetCreateDTO` - Создание бюджета
- `GoalCreateDTO` - Создание цели
- `DebtCreateDTO` - Создание долга

### Пример:

```typescript
import { OperationCreateDTO } from './types/dto';

// Преобразование API запроса в DTO
const apiRequest: CreateOperationRequest = req.body;
const dto: OperationCreateDTO = {
  title: apiRequest.title,
  amount: apiRequest.amount,
  category: apiRequest.category,
  type: apiRequest.type,
  userId: req.user?.id || '', // Добавляем из контекста
  date: apiRequest.date || new Date(),
  currency: apiRequest.currency || 'RUB'
};

// Использование DTO в модели
const operation = await OperationModel.create(dto);
```

---

## 🔄 Преобразование типов

### Поток данных:

```
API Request (CreateOperationRequest)
    ↓
Controller: Request → DTO (OperationCreateDTO)
    ↓
Model: DTO → SQL → Database Table (OperationTable)
    ↓
Model: Database Table → Model (IOperation)
    ↓
Controller: Model → DTO → API Response (OperationDTO)
    ↓
API Response (OperationDTO)
```

### Пример полного цикла:

```typescript
// 1. API Request
const request: CreateOperationRequest = {
  title: 'Покупка',
  amount: -1000,
  category: 'Еда',
  type: 'expense'
};

// 2. Controller: Request → DTO
const dto: OperationCreateDTO = {
  ...request,
  userId: req.user?.id || '',
  date: request.date || new Date(),
  currency: request.currency || 'RUB'
};

// 3. Model: DTO → Database
const dbRecord: OperationTable = await OperationModel.create(dto);

// 4. Model: Database → Model
const model: IOperation = OperationModel.transformOperation(dbRecord);

// 5. Controller: Model → API Response
const response: OperationDTO = {
  id: model.id!,
  title: model.title,
  amount: model.amount,
  category: model.category,
  type: model.type,
  date: new Date(model.date).toISOString(),
  currency: model.currency
};

// 6. Отправка ответа
res.json({ success: true, data: response });
```

---

## 📝 Best Practices

1. **Всегда используйте типы**: Не используйте `any`, всегда указывайте типы
2. **Разделение слоев**: 
   - API типы только в контроллерах
   - DTO типы между контроллерами и моделями
   - Database типы только в моделях
3. **Трансформация данных**: Преобразуйте данные на границах слоев
4. **Валидация**: Валидируйте входные данные перед преобразованием в DTO

---

## 🔍 Поиск типов

### По функциональности:

- **Операции**: `OperationTable`, `OperationDTO`, `OperationCreateDTO`
- **Пользователи**: `UserTable`, `UserDTO`, `UserCreateDTO`
- **Бюджеты**: `BudgetTable`, `BudgetDTO`, `BudgetCreateDTO`
- **Цели**: `GoalTable`, `GoalDTO`, `GoalCreateDTO`
- **Долги**: `DebtTable`, `DebtDTO`, `DebtCreateDTO`

### По слою:

- **Database**: Все типы с суффиксом `Table` в `database.ts`
- **API**: Все типы с суффиксом `Request`, `Response`, `DTO` в `api.ts`
- **DTO**: Все типы с суффиксом `DTO` в `dto.ts`

