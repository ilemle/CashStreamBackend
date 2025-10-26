# CashStream Backend API

Backend на Express.js для приложения CashStream.

## 🚀 Начало работы

### Требования
- Node.js (v14 или выше)
- MongoDB
- yarn или npm

### Установка

1. Установите зависимости:
```bash
yarn install
```

2. Файл `.env` уже создан. При необходимости измените переменные окружения:
```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cashstream
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

3. Запустите development сервер:
```bash
yarn dev
```

4. Или запустите production сервер:
```bash
yarn start
```

## 📝 Доступные команды

- `yarn start` - Запустить production сервер
- `yarn dev` - Запустить development сервер с nodemon

## 🔗 Эндпоинты

- `GET /` - Информация об API
- `GET /health` - Проверка работоспособности сервера

## 🛠️ Стек технологий

- **Express.js** - веб-фреймворк
- **MongoDB + Mongoose** - база данных
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей
- **CORS** - разрешение кросс-доменных запросов
- **Morgan** - логирование запросов
- **dotenv** - управление переменными окружения
- **nodemon** - автоматическая перезагрузка при разработке

## 📁 Структура проекта

```
backendCashStream/
├── src/
│   ├── config/         # Конфигурация (БД и т.д.)
│   ├── controllers/    # Контроллеры (auth, operations, budgets, goals)
│   ├── middleware/      # Middleware (auth, errorHandler)
│   ├── models/         # Модели Mongoose (User, Operation, Budget, Goal)
│   ├── routes/         # Маршруты API
│   └── utils/         # Утилиты
├── index.js            # Точка входа
├── package.json
└── .env               # Переменные окружения
```

## 🔌 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя (требует токен)

### Операции
- `GET /api/operations` - Получить все операции (требует токен)
- `GET /api/operations/:id` - Получить одну операцию (требует токен)
- `POST /api/operations` - Создать операцию (требует токен)
- `PUT /api/operations/:id` - Обновить операцию (требует токен)
- `DELETE /api/operations/:id` - Удалить операцию (требует токен)
- `GET /api/operations/balance` - Получить баланс (требует токен)

### Бюджеты
- `GET /api/budgets` - Получить все бюджеты (требует токен)
- `POST /api/budgets` - Создать бюджет (требует токен)
- `PUT /api/budgets/:id` - Обновить бюджет (требует токен)
- `DELETE /api/budgets/:id` - Удалить бюджет (требует токен)

### Цели
- `GET /api/goals` - Получить все цели (требует токен)
- `POST /api/goals` - Создать цель (требует токен)
- `PUT /api/goals/:id` - Обновить цель (требует токен)
- `DELETE /api/goals/:id` - Удалить цель (требует токен)

## 📱 Интеграция с мобильным приложением

Мобильное приложение настроено для работы с этим API через React Query. Все необходимые файлы созданы в `mobileCashStream/src/api/`.
