# Установка MongoDB через Docker

## Шаг 1: Установить Docker
Если Docker не установлен:
```bash
brew install --cask docker
```
Затем запустите Docker Desktop.

## Шаг 2: Запустить MongoDB контейнер

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

## Шаг 3: Проверить работу

```bash
docker ps | grep mongodb
```

Должен показать запущенный контейнер.

## Шаг 4: Запустить проект

```bash
yarn dev
```

MongoDB будет работать на `localhost:27017`

## Остановить MongoDB

```bash
docker stop mongodb
```

## Запустить снова

```bash
docker start mongodb
```

## Удалить (если нужно)

```bash
docker rm -f mongodb
docker volume rm mongodb_data
```

