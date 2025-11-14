# 🚀 Быстрый старт - Архитектура CashStream Backend

## 📋 Что было сделано

✅ Построена четкая многослойная архитектура  
✅ Созданы типы для всех таблиц БД (10 таблиц)  
✅ Созданы типы для всех API роутов (50+ типов)  
✅ Созданы DTO для передачи данных между слоями  
✅ Написана полная документация  

---

## 📁 Структура типов

```
src/types/
├── database.ts    # Типы таблиц БД
├── api.ts         # Типы API запросов/ответов  
├── dto.ts         # Data Transfer Objects
└── express.d.ts   # Расширение Express
```

---

## 🗄️ Таблицы БД

| Таблица | Тип | Описание |
|---------|-----|----------|
| `users` | `UserTable` | Пользователи |
| `operations` | `OperationTable` | Операции (доходы/расходы/переводы) |
| `categories` | `CategoryTable` | Категории |
| `subcategories` | `SubcategoryTable` | Подкатегории |
| `budgets` | `BudgetTable` | Бюджеты |
| `goals` | `GoalTable` | Цели |
| `debts` | `DebtTable` | Долги |
| `email_verifications` | `EmailVerificationTable` | Верификация email |
| `phone_verifications` | `PhoneVerificationTable` | Верификация телефона |
| `telegram_auth_sessions` | `TelegramAuthSessionTable` | Сессии Telegram |

📖 **Подробнее**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 🌐 API Endpoints

### Operations (`/api/operations`)
- `GET /api/operations` - Список операций
- `POST /api/operations` - Создать операцию
- `GET /api/operations/:id` - Получить операцию
- `PUT /api/operations/:id` - Обновить операцию
- `DELETE /api/operations/:id` - Удалить операцию
- `GET /api/operations/balance` - Баланс
- `POST /api/operations/batch` - Пакетное создание

### Auth (`/api/auth`)
- `POST /api/auth/register/send-code` - Отправить код
- `POST /api/auth/register/verify` - Верифицировать
- `POST /api/auth/login` - Войти
- `GET /api/auth/me` - Текущий пользователь

### Budgets (`/api/budgets`)
- `GET /api/budgets` - Список бюджетов
- `POST /api/budgets` - Создать бюджет
- `PUT /api/budgets/:id` - Обновить бюджет
- `DELETE /api/budgets/:id` - Удалить бюджет

### Goals (`/api/goals`)
- `GET /api/goals` - Список целей
- `POST /api/goals` - Создать цель
- `PUT /api/goals/:id` - Обновить цель
- `DELETE /api/goals/:id` - Удалить цель

### Categories (`/api/categories`)
- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создать категорию

### Debts (`/api/debts`)
- `GET /api/debts` - Список долгов
- `POST /api/debts` - Создать долг
- `GET /api/debts/overdue` - Просроченные долги

📖 **Подробнее**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🔄 Как использовать типы

### 1. В контроллере

```typescript
import { CreateOperationRequest, OperationDTO } from '../types/api';
import { OperationCreateDTO } from '../types/dto';

export const createOperation = async (
  req: Request<{}, {}, CreateOperationRequest>,
  res: Response<{ success: boolean; data: OperationDTO }>
) => {
  // Request → DTO
  const dto: OperationCreateDTO = {
    ...req.body,
    userId: req.user?.id || ''
  };
  
  // Вызов модели
  const operation = await Operation.create(dto);
  
  // Model → DTO → Response
  res.json({ success: true, data: toDTO(operation) });
};
```

### 2. В модели

```typescript
import { OperationTable } from '../types/database';
import { OperationCreateDTO } from '../types/dto';

class OperationModel {
  static async create(data: OperationCreateDTO): Promise<OperationTable> {
    // SQL запрос
    // ...
    return { ...data, id } as OperationTable;
  }
}
```

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Полная архитектура приложения |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Схема всех таблиц БД |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Документация всех API эндпоинтов |
| [TYPES_OVERVIEW.md](./TYPES_OVERVIEW.md) | Обзор всех типов |
| [EXAMPLES.md](./EXAMPLES.md) | Примеры использования |
| [src/types/README.md](./src/types/README.md) | Документация типов |

---

## 🎯 Принципы архитектуры

1. **Многослойность**: Routes → Controllers → Models → DB
2. **Типизация**: Все данные типизированы
3. **Разделение ответственности**: Каждый слой отвечает за свою задачу
4. **DTO паттерн**: Отделение внутренней структуры от API
5. **Единая структура**: Все ответы в формате `{ success, data, message }`

---

## 🚀 Добавление нового функционала

1. Создать типы в `src/types/`
2. Создать модель в `src/models/`
3. Создать контроллер в `src/controllers/`
4. Создать роуты в `src/routes/`
5. Зарегистрировать в `src/index.ts`

📖 **Подробный пример**: [EXAMPLES.md](./EXAMPLES.md#создание-нового-эндпоинта)

---

## ✅ Готово к использованию!

Архитектура построена, типы созданы, документация написана.  
Проект готов к расширению и изменению без проблем! 🎉
