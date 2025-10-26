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
│   ├── controllers/    # Контроллеры
│   ├── middleware/      # Middleware
│   ├── models/         # Модели Mongoose
│   ├── routes/         # Маршруты
│   └── utils/         # Утилиты
├── index.js            # Точка входа
├── package.json
└── .env               # Переменные окружения
```

# CashStreamBackend
