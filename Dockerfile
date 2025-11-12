# Stage 1: Сборка проекта
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
COPY package.json yarn.lock* ./ 

# Устанавливаем ВСЕ зависимости (включая dev) для сборки
RUN yarn install --frozen-lockfile

# Копируем остальной код приложения
COPY . .

# Явно копируем папку scripts для миграций
COPY scripts scripts

# Собираем TypeScript проект
# Скрипт build:backend скомпилирует только бэкенд
RUN yarn build:backend

# Stage 2: Production образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и yarn.lock для установки только production зависимостей
COPY package.json yarn.lock* ./

# Устанавливаем только production зависимости
RUN yarn install --production --frozen-lockfile

# Копируем собранные файлы из stage сборки
COPY --from=builder /app/dist ./dist
# Копируем папку scripts в финальный образ
COPY scripts scripts

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["node", "dist/index.js"]
