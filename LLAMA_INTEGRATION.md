# 🦙 Интеграция Llama в Backend

## 📋 Обзор

Это руководство покажет, как интегрировать Llama LLM в ваш Express бекенд для AI чата. Есть несколько вариантов в зависимости от ваших потребностей.

## 🎯 Варианты интеграции

### Вариант 1: Ollama в Docker контейнере (Рекомендуется) 🐳⭐

**Самый простой способ** - запустить Ollama в Docker контейнере. Не требует установки на систему и легко управляется.

#### Шаг 1: Установите Docker

```bash
# macOS
brew install --cask docker

# Или скачайте Docker Desktop с https://www.docker.com/products/docker-desktop
```

#### Шаг 2: Запустите Ollama контейнер

```bash
cd backendCashStream
docker-compose up -d
```

#### Шаг 3: Загрузите модель

```bash
# Загрузите модель в контейнер
docker exec -it cashstream-ollama ollama pull llama3.2:1b

# Или для лучшего качества:
docker exec -it cashstream-ollama ollama pull llama3.2:3b
```

#### Шаг 4: Проверьте работу

```bash
# Проверьте, что Ollama работает
curl http://localhost:11434/api/tags
```

**Подробная инструкция:** См. `DOCKER_SETUP.md`

---

### Вариант 2: Ollama (Локальная установка)

**Ollama** - самый простой способ запустить Llama локально. Он предоставляет REST API и работает из коробки.

#### Шаг 1: Установка Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Скачайте с https://ollama.com/download
```

#### Шаг 2: Запуск Ollama и загрузка модели

```bash
# Запустите Ollama (он работает как сервис)
ollama serve

# В другом терминале загрузите модель
# Для финансового ассистента подойдет небольшая модель:
ollama pull llama3.2:1b  # Очень быстрая, ~1.3GB
# или
ollama pull llama3.2:3b  # Баланс скорости/качества, ~2GB
# или
ollama pull mistral:7b  # Лучшее качество, ~4.1GB
```

#### Шаг 3: Установка зависимостей в бекенд

```bash
cd backendCashStream
yarn add axios
```

#### Шаг 4: Создание AI контроллера

Создайте файл `src/controllers/aiController.ts`:

```typescript
import axios from 'axios';
import { Request, Response } from 'express';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2:1b';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Системный промпт для финансового ассистента
const SYSTEM_PROMPT = `Ты финансовый ассистент CashStream. Твоя задача - помогать пользователям с вопросами о финансах, бюджете, расходах и доходах. 
Отвечай кратко, дружелюбно и по делу. Если не знаешь ответа, честно скажи об этом.`;

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Формируем историю сообщений
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // Отправляем запрос в Ollama
    const response = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: MODEL_NAME,
        messages: messages,
        stream: false, // Для стриминга установите true
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      },
      {
        timeout: 60000 // 60 секунд таймаут
      }
    );

    const aiResponse = response.data.message.content;

    res.json({
      success: true,
      response: aiResponse
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Ollama service is not running. Please start it with: ollama serve'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// Для стриминга (постепенная печать)
export const streamChatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // Настраиваем стриминг
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: MODEL_NAME,
        messages: messages,
        stream: true,
        options: {
          temperature: 0.7,
        }
      },
      {
        responseType: 'stream',
        timeout: 120000
      }
    );

    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.message?.content) {
              res.write(`data: ${JSON.stringify({ content: data.message.content })}\n\n`);
            }
            if (data.done) {
              res.write('data: [DONE]\n\n');
              res.end();
            }
          } catch (e) {
            // Игнорируем ошибки парсинга
          }
        }
      }
    });

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (error: Error) => {
      console.error('Stream error:', error);
      res.end();
    });

  } catch (error: any) {
    console.error('AI Stream Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to stream AI response'
      });
    }
  }
};
```

#### Шаг 5: Создание роутов

Создайте файл `src/routes/aiRoutes.ts`:

```typescript
import { Router } from 'express';
import { chatWithAI, streamChatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

// Обычный чат (не стриминг)
router.post('/chat', protect, chatWithAI);

// Стриминг чат (для постепенной печати)
router.post('/chat/stream', protect, streamChatWithAI);

export default router;
```

#### Шаг 6: Подключение роутов в `src/index.ts`

```typescript
// Добавьте импорт
import aiRoutes from './routes/aiRoutes';

// Добавьте роут (после других API роутов)
app.use('/api/ai', aiRoutes);
```

#### Шаг 7: Добавьте переменные окружения в `.env`

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

---

### Вариант 3: OpenAI API (Облачный сервис)

Если хотите использовать готовый сервис без локальной установки.

#### Шаг 1: Установка зависимостей

```bash
yarn add openai
```

#### Шаг 2: Создание контроллера

```typescript
import OpenAI from 'openai';
import { Request, Response } from 'express';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Ты финансовый ассистент CashStream...`;

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // или 'gpt-4' для лучшего качества
      messages: messages,
      temperature: 0.7,
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });

  } catch (error: any) {
    console.error('OpenAI Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response'
    });
  }
};
```

#### Шаг 3: Добавьте в `.env`

```env
OPENAI_API_KEY=your-api-key-here
```

---

### Вариант 4: Прямая интеграция с llama.cpp (Продвинутый)

Для полного контроля над моделью.

#### Шаг 1: Установка llama-cpp-node

```bash
yarn add llama-cpp-node
```

#### Шаг 2: Скачайте модель

Скачайте GGUF модель с https://huggingface.co/models

#### Шаг 3: Использование

```typescript
import { LLama } from 'llama-cpp-node';

// Инициализация модели (делается один раз при старте)
const llama = new LLama({
  modelPath: './models/llama-3.2-1b.Q4_K_M.gguf',
  nCtx: 2048,
  nGpuLayers: 0, // 0 для CPU, больше для GPU
});

export const chatWithAI = async (req: Request, res: Response) => {
  const { message } = req.body;
  
  const response = await llama.createCompletion({
    prompt: `System: ${SYSTEM_PROMPT}\nUser: ${message}\nAssistant:`,
    nPredict: 512,
    temperature: 0.7,
  });

  res.json({
    success: true,
    response: response.text
  });
};
```

---

## 📱 Интеграция в мобильное приложение

После настройки бекенда, обновите `src/api/operations.ts` или создайте `src/api/ai.ts`:

```typescript
import { apiClient } from './client';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  response: string;
}

export const aiApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/ai/chat', data);
    return response.data;
  },
};
```

Затем обновите `AIChatScreen.tsx`:

```typescript
import { aiApi } from '../api/ai';

const handleSend = async () => {
  // ... существующий код ...
  
  setIsLoading(true);
  
  try {
    const response = await aiApi.chat({
      message: inputText.trim(),
      conversationHistory: messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp
      }))
    });
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.response,
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Начинаем эффект печати
    typewriterEffect(aiMessage.id, response.response, 30);
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    // Обработка ошибок
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🚀 Быстрый старт (Docker - Рекомендуется)

1. **Установите Docker:**
   ```bash
   # macOS
   brew install --cask docker
   ```

2. **Запустите Ollama контейнер:**
   ```bash
   cd backendCashStream
   docker-compose up -d
   ```

3. **Загрузите модель:**
   ```bash
   docker exec -it cashstream-ollama ollama pull llama3.2:1b
   ```

4. **Добавьте код в бекенд** (см. выше)

5. **Добавьте роут в `src/index.ts`:**
   ```typescript
   import aiRoutes from './routes/aiRoutes';
   app.use('/api/ai', aiRoutes);
   ```

6. **Обновите мобильное приложение** (см. выше)

7. **Протестируйте:**
   ```bash
   curl -X POST http://localhost:3000/api/ai/chat \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Привет! Как мне сэкономить деньги?"}'
   ```

---

## 🚀 Быстрый старт (Локальная установка)

1. **Установите Ollama:**
   ```bash
   brew install ollama
   ```

2. **Запустите Ollama:**
   ```bash
   ollama serve
   ```

3. **Загрузите модель:**
   ```bash
   ollama pull llama3.2:1b
   ```

4. **Добавьте код в бекенд** (см. выше)

5. **Добавьте роут в `src/index.ts`:**
   ```typescript
   import aiRoutes from './routes/aiRoutes';
   app.use('/api/ai', aiRoutes);
   ```

6. **Обновите мобильное приложение** (см. выше)

7. **Протестируйте:**
   ```bash
   curl -X POST http://localhost:3000/api/ai/chat \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Привет! Как мне сэкономить деньги?"}'
   ```

---

## 📊 Рекомендации по моделям

| Модель | Размер | Скорость | Качество | Рекомендация |
|--------|--------|----------|----------|--------------|
| llama3.2:1b | ~1.3GB | ⚡⚡⚡ | ⭐⭐ | Для быстрого прототипирования |
| llama3.2:3b | ~2GB | ⚡⚡ | ⭐⭐⭐ | Баланс скорости/качества |
| mistral:7b | ~4.1GB | ⚡ | ⭐⭐⭐⭐ | Лучшее качество для продакшена |

---

## 🔧 Troubleshooting

### Ollama не запускается
```bash
# Проверьте, запущен ли Ollama
curl http://localhost:11434/api/tags

# Если нет, запустите
ollama serve
```

### Модель не найдена
```bash
# Проверьте установленные модели
ollama list

# Если нужной нет, загрузите
ollama pull llama3.2:1b
```

### Медленные ответы
- Используйте меньшую модель (1b или 3b)
- Уменьшите `nPredict` в настройках
- Используйте GPU если доступно

---

## ✅ Готово!

Теперь ваш AI чат подключен к Llama! 🎉

