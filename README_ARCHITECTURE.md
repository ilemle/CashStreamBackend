# 🏗️ Архитектура Backend CashStream

## 📚 Документация

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Подробное описание архитектуры
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Схема базы данных
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Документация API

## 🎯 Быстрый старт

### Структура проекта

```
src/
├── types/          # ✨ Типы данных (БД, API, DTO)
├── routes/          # Маршрутизация
├── controllers/     # Обработчики запросов
├── models/          # Работа с БД
├── services/        # Бизнес-логика
├── middleware/      # Middleware функции
└── utils/           # Вспомогательные функции
```

## 📊 Типы данных

### 1. Типы БД (`src/types/database.ts`)

Определяют структуру таблиц базы данных:

```typescript
import { OperationTable, UserTable, BudgetTable } from './types/database';
```

**Доступные типы**:
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

### 2. Типы API (`src/types/api.ts`)

Определяют структуру запросов и ответов API:

```typescript
import { 
  CreateOperationRequest,
  OperationDTO,
  GetOperationsResponse 
} from './types/api';
```

**Основные типы**:
- `OperationDTO` - Операция для API
- `CreateOperationRequest` - Запрос создания операции
- `UpdateOperationRequest` - Запрос обновления операции
- `GetOperationsResponse` - Ответ со списком операций
- `BalanceResponse` - Ответ с балансом
- И другие...

### 3. DTO (`src/types/dto.ts`)

Объекты для передачи данных между слоями:

```typescript
import { 
  OperationCreateDTO,
  OperationUpdateDTO,
  OperationFilterDTO 
} from './types/dto';
```

## 🔄 Поток данных

```
API Request
    ↓
Routes (валидация, auth)
    ↓
Controllers (преобразование Request → DTO)
    ↓
Models (DTO → SQL → Model)
    ↓
Database
    ↓
Response (Model → DTO → API Response)
```

## 🚀 Добавление нового функционала

### Пример: Добавление нового эндпоинта

1. **Добавить типы БД** (`src/types/database.ts`):
```typescript
export interface NewEntityTable {
  id: string;
  name: string;
  userId: string;
  // ...
}
```

2. **Добавить типы API** (`src/types/api.ts`):
```typescript
export interface CreateNewEntityRequest {
  name: string;
}

export interface NewEntityDTO {
  id: string;
  name: string;
  // ...
}
```

3. **Создать модель** (`src/models/NewEntity.ts`):
```typescript
import { NewEntityTable } from '../types/database';
import { NewEntityCreateDTO } from '../types/dto';

class NewEntityModel {
  static async create(data: NewEntityCreateDTO): Promise<NewEntityTable> {
    // ...
  }
}
```

4. **Создать контроллер** (`src/controllers/newEntityController.ts`):
```typescript
import { CreateNewEntityRequest, NewEntityDTO } from '../types/api';

export const createNewEntity = async (req: Request, res: Response) => {
  const dto: NewEntityCreateDTO = {
    ...req.body,
    userId: req.user?.id || ''
  };
  const entity = await NewEntityModel.create(dto);
  res.status(201).json({ success: true, data: entity });
};
```

5. **Создать роуты** (`src/routes/newEntityRoutes.ts`):
```typescript
router.post('/', protect, createNewEntity);
```

6. **Зарегистрировать** (`src/index.ts`):
```typescript
app.use('/api/new-entities', newEntityRoutes);
```

## 📋 Таблицы БД

| Таблица | Описание | Тип |
|---------|----------|-----|
| `users` | Пользователи | `UserTable` |
| `operations` | Операции | `OperationTable` |
| `categories` | Категории | `CategoryTable` |
| `subcategories` | Подкатегории | `SubcategoryTable` |
| `budgets` | Бюджеты | `BudgetTable` |
| `goals` | Цели | `GoalTable` |
| `debts` | Долги | `DebtDTO` |
| `email_verifications` | Верификация email | `EmailVerificationTable` |
| `phone_verifications` | Верификация телефона | `PhoneVerificationTable` |
| `telegram_auth_sessions` | Сессии Telegram | `TelegramAuthSessionTable` |

## 🎨 Принципы

1. **Типизация**: Все данные типизированы
2. **Разделение слоев**: Routes → Controllers → Models → DB
3. **DTO паттерн**: Отделение внутренней структуры от API
4. **Единая структура ответов**: Все ответы в формате `{ success, data, message }`
5. **Обработка ошибок**: Централизованная через `errorHandler`

## 📖 Дополнительно

- См. [ARCHITECTURE.md](./ARCHITECTURE.md) для детального описания
- См. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) для схемы БД
- См. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) для API

