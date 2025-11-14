# Обзор типов данных

## 📊 Структура типов

```
src/types/
├── database.ts    # Типы таблиц БД (10 таблиц)
├── api.ts         # Типы API запросов/ответов (50+ типов)
├── dto.ts         # Data Transfer Objects (15+ типов)
└── express.d.ts   # Расширение Express типов
```

---

## 🗄️ Типы таблиц БД (database.ts)

| Тип | Таблица | Описание |
|-----|---------|----------|
| `UserTable` | `users` | Пользователи |
| `OperationTable` | `operations` | Финансовые операции |
| `CategoryTable` | `categories` | Категории |
| `SubcategoryTable` | `subcategories` | Подкатегории |
| `BudgetTable` | `budgets` | Бюджеты |
| `GoalTable` | `goals` | Цели |
| `DebtTable` | `debts` | Долги |
| `EmailVerificationTable` | `email_verifications` | Верификация email |
| `PhoneVerificationTable` | `phone_verifications` | Верификация телефона |
| `TelegramAuthSessionTable` | `telegram_auth_sessions` | Сессии Telegram |

**Использование**: Только в моделях (`src/models/`)

---

## 🌐 Типы API (api.ts)

### Operations API

| Тип | Назначение |
|-----|------------|
| `OperationDTO` | Операция для API |
| `CreateOperationRequest` | Запрос создания |
| `UpdateOperationRequest` | Запрос обновления |
| `GetOperationsQuery` | Query параметры |
| `GetOperationsResponse` | Ответ со списком |
| `BalanceResponse` | Ответ с балансом |
| `CreateOperationsBatchRequest` | Пакетное создание |

### Auth API

| Тип | Назначение |
|-----|------------|
| `UserDTO` | Пользователь для API |
| `LoginRequest` | Запрос входа |
| `LoginResponse` | Ответ входа |
| `RegisterVerifyRequest` | Запрос регистрации |
| `GetMeResponse` | Ответ с пользователем |

### Budgets API

| Тип | Назначение |
|-----|------------|
| `BudgetDTO` | Бюджет для API |
| `CreateBudgetRequest` | Запрос создания |
| `UpdateBudgetRequest` | Запрос обновления |

### Goals API

| Тип | Назначение |
|-----|------------|
| `GoalDTO` | Цель для API |
| `CreateGoalRequest` | Запрос создания |
| `UpdateGoalRequest` | Запрос обновления |

### Categories API

| Тип | Назначение |
|-----|------------|
| `CategoryDTO` | Категория для API |
| `SubcategoryDTO` | Подкатегория для API |
| `CreateCategoryRequest` | Запрос создания |

### Debts API

| Тип | Назначение |
|-----|------------|
| `DebtDTO` | Долг для API |
| `CreateDebtRequest` | Запрос создания |
| `UpdateDebtRequest` | Запрос обновления |

**Использование**: В контроллерах и роутах (`src/controllers/`, `src/routes/`)

---

## 🔄 DTO типы (dto.ts)

| Тип | Назначение |
|-----|-----------|
| `OperationCreateDTO` | Создание операции |
| `OperationUpdateDTO` | Обновление операции |
| `OperationFilterDTO` | Фильтрация операций |
| `UserCreateDTO` | Создание пользователя |
| `UserUpdateDTO` | Обновление пользователя |
| `BudgetCreateDTO` | Создание бюджета |
| `BudgetUpdateDTO` | Обновление бюджета |
| `GoalCreateDTO` | Создание цели |
| `GoalUpdateDTO` | Обновление цели |
| `DebtCreateDTO` | Создание долга |
| `DebtUpdateDTO` | Обновление долга |
| `CategoryCreateDTO` | Создание категории |
| `SubcategoryCreateDTO` | Создание подкатегории |

**Использование**: Между контроллерами и моделями

---

## 🔄 Поток преобразования типов

```
1. API Request (CreateOperationRequest)
   ↓
2. Controller: Request → DTO (OperationCreateDTO)
   ↓
3. Model: DTO → SQL → Database (OperationTable)
   ↓
4. Model: Database → Model (IOperation)
   ↓
5. Controller: Model → DTO → API Response (OperationDTO)
   ↓
6. API Response (OperationDTO)
```

---

## 📝 Примеры использования

### В контроллере:

```typescript
import { CreateOperationRequest, OperationDTO } from '../types/api';
import { OperationCreateDTO } from '../types/dto';

// Типизация запроса
export const createOperation = async (
  req: Request<{}, {}, CreateOperationRequest>,
  res: Response<{ success: boolean; data: OperationDTO }>
) => {
  // Преобразование Request → DTO
  const dto: OperationCreateDTO = {
    ...req.body,
    userId: req.user?.id || ''
  };
  
  // Вызов модели
  const operation = await Operation.create(dto);
  
  // Преобразование Model → DTO → Response
  const response: OperationDTO = {
    id: operation.id!,
    title: operation.title,
    // ...
  };
  
  res.json({ success: true, data: response });
};
```

### В модели:

```typescript
import { OperationTable } from '../types/database';
import { OperationCreateDTO } from '../types/dto';

class OperationModel {
  static async create(data: OperationCreateDTO): Promise<OperationTable> {
    // SQL запрос
    const [result] = await pool.execute(
      'INSERT INTO operations (...) VALUES (...)',
      [...]
    );
    
    // Возврат как OperationTable
    return { ...data, id: uuidv4() } as OperationTable;
  }
}
```

---

## 🎯 Принципы работы с типами

1. **Не смешивайте слои**: 
   - API типы только в контроллерах
   - Database типы только в моделях
   - DTO между слоями

2. **Всегда типизируйте**:
   ```typescript
   // ✅ Хорошо
   const dto: OperationCreateDTO = { ... };
   
   // ❌ Плохо
   const dto: any = { ... };
   ```

3. **Используйте преобразование**:
   ```typescript
   // Создайте функции преобразования
   const toDTO = (model: IOperation): OperationDTO => ({ ... });
   ```

4. **Валидируйте данные**:
   ```typescript
   if (!req.body.title) {
     return res.status(400).json({ 
       success: false, 
       message: 'Title is required' 
     });
   }
   ```

---

## 📚 Дополнительная документация

- [src/types/README.md](./src/types/README.md) - Подробная документация типов
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Архитектура приложения
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Схема БД
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API документация
- [EXAMPLES.md](./EXAMPLES.md) - Примеры использования

