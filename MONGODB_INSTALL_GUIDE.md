# Установка MongoDB на macOS

## Шаг 1: Обновить Command Line Tools

```bash
# Обновить Command Line Tools
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

Если это не сработает, скачайте вручную:
https://developer.apple.com/download/all/

## Шаг 2: Установить MongoDB

```bash
# Добавить tap для MongoDB
brew tap mongodb/brew

# Установить MongoDB Community
brew install mongodb-community

# Запустить MongoDB как службу
brew services start mongodb-community

# Или запустить вручную
mongod --config /opt/homebrew/etc/mongod.conf
```

## Шаг 3: Проверить работу

```bash
# MongoDB должен быть запущен на порту 27017
brew services list | grep mongodb

# Проверить подключение
mongosh
```

## Альтернативный вариант: MongoDB Atlas (облачная БД)

1. Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный кластер
3. Получите connection string
4. Обновите `.env`:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cashstream
```

## После установки MongoDB

Просто запустите сервер:

```bash
yarn dev
```

MongoDB подключится автоматически!

