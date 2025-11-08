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
Отвечай кратко, дружелюбно и по делу. Если не знаешь ответа, честно скажи об этом.
Используй простой и понятный язык.`;

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
        stream: false,
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

    return res.json({
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

    if (error.response?.status === 404) {
      return res.status(503).json({
        success: false,
        message: `Model ${MODEL_NAME} not found. Please run: ollama pull ${MODEL_NAME}`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// Для стриминга (постепенная печать) - опционально
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

    // Для стриминга не возвращаем значение, так как ответ отправляется через события
    return;

  } catch (error: any) {
    console.error('AI Stream Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to stream AI response'
      });
    }
    // Если заголовки уже отправлены, просто завершаем
    return;
  }
};

