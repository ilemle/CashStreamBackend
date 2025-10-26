# Решение проблемы: Timeout при регистрации

## Проблема:
```
timeout of 10000ms exceeded
```

## Причины:

1. **Мобильное приложение использует локальный IP** вашего компьютера
2. **Backend должен быть доступен по этому IP**
3. **Модели были переписаны с MongoDB на MySQL**

## Решение:

### 1. Узнайте ваш IP:
```bash
ifconfig | grep "inet "
```

Найдите строку вида: `inet 192.168.x.x`

### 2. Обновите `mobileCashStream/src/api/config.ts`:

Замените IP на ваш:
```typescript
const url = 'http://ВАШ_IP:3000/api';
```

### 3. Убедитесь что сервер запущен:

```bash
# В backendCashStream
yarn dev

# Сервер должен показать:
# 🚀 Server is running on http://localhost:3000
```

### 4. Проверьте доступность по IP:

```bash
# Замените на ваш IP
curl http://192.168.31.154:3000/

# Должен вернуть JSON
```

### 5. Для эмуляторов:

- **iOS Simulator**: `localhost:3000` ✅
- **Android Emulator**: `10.0.2.2:3000` ✅
- **Физическое устройство**: `ВАШ_IP:3000` (например, `192.168.31.154:3000`)

## Создание пользователя вручную (для теста):

```bash
mysql -u root
USE cashstream;

INSERT INTO users (name, email, password) 
VALUES (
  'Test User', 
  'test@test.com', 
  '$2b$10$ваш_хеш_пароля'
);
```

## Запуск в эмуляторе (Рекомендуется):

Лучше всего тестировать в эмуляторе где `localhost` работает:

```bash
# iOS Simulator - работает localhost
yarn ios

# Android Emulator - работает 10.0.2.2
yarn android
```

