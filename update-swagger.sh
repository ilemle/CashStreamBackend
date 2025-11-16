#!/bin/bash

echo "🔄 Updating Swagger configuration..."

# Остановить контейнеры
docker-compose down

# Пересобрать с новыми аннотациями
docker-compose build --no-cache

# Запустить
docker-compose up -d

echo "✅ Swagger updated! Check http://your-server:3000/api-docs"
echo "📊 Check logs: docker-compose logs backend | grep '🔍 Swagger'"
