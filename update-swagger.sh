#!/bin/bash

echo "🔄 Updating Swagger configuration..."

# Остановить контейнеры
docker-compose down

# Пересобрать с новыми аннотациями
docker-compose build --no-cache

# Запустить
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 5

echo "📊 Checking Swagger logs..."
docker-compose logs backend | grep -E "🔍|📚|📊" | tail -10

echo ""
echo "✅ Swagger updated!"
echo "🌐 Swagger UI: http://your-server:3000/api-docs"
echo "🖥️  Simple Test UI: http://your-server:3000/test-ui"
echo "📄 Raw specs: http://your-server:3000/api-docs.json"
echo "🔍 Debug info: http://your-server:3000/debug/swagger"
echo "🧪 Test endpoints:"
echo "   - Simple: http://your-server:3000/api/test/simple"
echo "   - Auth: http://your-server:3000/api/test"
echo "   - Protected: http://your-server:3000/api/test/protected"
echo ""
echo "🔧 If Swagger UI doesn't expand routes:"
echo "   1. Check http://your-server:3000/debug/swagger for path count"
echo "   2. Try http://your-server:3000/test-ui for basic API testing"
echo "   3. Check browser console for JavaScript errors"
