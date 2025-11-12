# Используем официальный образ Node.js в качестве базового образа
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
# Используем только production зависимости
COPY package.json yarn.lock* ./ 

# Устанавливаем зависимости. --frozen-lockfile гарантирует, что версии пакетов будут точно соответствовать lock-файлу.
RUN yarn install --production --frozen-lockfile

# Копируем остальной код приложения
COPY . .

# Собираем TypeScript проект
# Скрипт build:backend скомпилирует только бэкенд
RUN yarn build:backend

# Если у вас есть статические файлы для админ-панели, их тоже нужно собрать
# Если админ-панель деплоится отдельно, этот шаг не нужен
# COPY admin admin
# RUN cd admin && yarn install --production --frozen-lockfile && yarn build

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Команда для запуска приложения
# PM2 будет использоваться для управления процессом в production
CMD ["node", "dist/index.js"]
