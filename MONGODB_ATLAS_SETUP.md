# Установка MongoDB Atlas (Облачная БД)

## Шаг 1: Регистрация
1. Перейдите на https://www.mongodb.com/cloud/atlas
2. Нажмите "Try Free"
3. Зарегистрируйтесь (можно через Google)

## Шаг 2: Создание кластера
1. Выберите "Build a Database"
2. Оставьте бесплатный вариант (M0 - Free)
3. Выберите регион (ближайший к вам)
4. Нажмите "Create"

## Шаг 3: Получить Connection String
1. Нажмите "Connect"
2. Выберите "Drivers"
3. Выберите "Node.js"
4. Скопируйте connection string (выглядит как):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Шаг 4: Настроить в проекте
Откройте файл `.env` и добавьте:

```bash
MONGODB_URI=mongodb+srv://ваш_username:ваш_пароль@cluster0.xxxxx.mongodb.net/cashstream?retryWrites=true&w=majority
```

Замените:
- `ваш_username` - ваше имя пользователя MongoDB Atlas
- `ваш_пароль` - ваш пароль
- `cluster0.xxxxx.mongodb.net` - адрес вашего кластера

## Шаг 5: Запустить сервер

```bash
yarn dev
```

Готово! БД будет в облаке, никаких локальных установок не требуется!

