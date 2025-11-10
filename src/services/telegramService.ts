import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN не установлен. Telegram бот не будет работать.');
}

// Создаем экземпляр бота
let bot: TelegramBot | null = null;

export const initializeTelegramBot = (): TelegramBot | null => {
  if (!token) {
    return null;
  }

  if (bot) {
    return bot;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    
    console.log('✅ Telegram бот инициализирован');

    // Обработка команды /start
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from?.id;
      const firstName = msg.from?.first_name || 'Пользователь';
      const lastName = msg.from?.last_name || '';
      const username = msg.from?.username || '';
      
      console.log(`📱 Получена команда /start от пользователя ${firstName} (ID: ${chatId}, Telegram ID: ${telegramId})`);
      
      // Создаем или обновляем пользователя сразу при /start
      if (telegramId) {
        try {
          const User = (await import('../models/User')).default;
          
          // Проверяем, существует ли пользователь
          const existingUser = await User.findOne({ telegramId: Number(telegramId) });
          
          const { pool } = await import('../config/database');
          
          if (!existingUser) {
            // Создаем нового пользователя
            const name = firstName 
              ? (lastName ? `${firstName} ${lastName}` : firstName)
              : (username || 'Telegram User');
            
            const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
            
            const newUser = await User.create({
              name,
              telegramId: Number(telegramId),
              password: randomPassword
            } as any);
            
            // Устанавливаем время последней активности для нового пользователя
            await pool.execute(
              'UPDATE users SET lastTelegramActivity = NOW() WHERE id = ?',
              [newUser.id]
            );
            
            console.log(`✅ Пользователь создан через Telegram: ${name} (telegramId: ${telegramId})`);
          } else {
            // Обновляем время последней активности в Telegram
            await pool.execute(
              'UPDATE users SET lastTelegramActivity = NOW() WHERE id = ?',
              [existingUser.id]
            );
            console.log(`✅ Пользователь уже существует: ${existingUser.name} (telegramId: ${telegramId}), обновлена активность`);
          }
        } catch (error) {
          console.error('❌ Ошибка при создании пользователя через Telegram:', error);
        }
      }
      
      // Отправляем сообщение об успешной регистрации
      bot?.sendMessage(
        chatId, 
        `✅ Регистрация успешна!\n\nПривет, ${firstName}! 👋\n\nДобро пожаловать в CashStream!\n\nТеперь вернитесь в приложение CashStream для завершения авторизации.`,
        {
          disable_web_page_preview: true
        }
      );
    });

    // Обработка команды /ping
    bot.onText(/\/ping/, (msg) => {
      const chatId = msg.chat.id;
      
      console.log(`📱 Получена команда /ping от пользователя (ID: ${chatId})`);
      
      bot?.sendMessage(chatId, '🏓 Pong!');
    });

    // Обработка всех текстовых сообщений (пока просто эхо)
    bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      
      // Игнорируем команды, они обрабатываются отдельно
      if (text && text.startsWith('/')) {
        return;
      }
      
      if (text) {
        console.log(`📱 Получено сообщение от пользователя (ID: ${chatId}): ${text}`);
        // Пока просто отвечаем эхом
        bot?.sendMessage(chatId, `Вы написали: ${text}`);
      }
    });

    // Обработка ошибок
    bot.on('polling_error', (error) => {
      console.error('❌ Ошибка polling Telegram бота:', error);
    });

    return bot;
  } catch (error) {
    console.error('❌ Ошибка при инициализации Telegram бота:', error);
    return null;
  }
};

export const getTelegramBot = (): TelegramBot | null => {
  return bot;
};

export const getBotUsername = async (): Promise<string | null> => {
  if (!bot) {
    return null;
  }

  try {
    const botInfo = await bot.getMe();
    return botInfo.username || null;
  } catch (error) {
    console.error('❌ Ошибка при получении информации о боте:', error);
    return null;
  }
};

export const getBotUrl = async (): Promise<string | null> => {
  const username = await getBotUsername();
  if (!username) {
    return null;
  }
  return `https://t.me/${username}`;
};

// Получение URL для открытия Telegram приложения напрямую
export const getBotAppUrl = async (): Promise<string | null> => {
  const username = await getBotUsername();
  if (!username) {
    return null;
  }
  // Используем tg:// схему для открытия Telegram приложения напрямую
  return `tg://resolve?domain=${username}`;
};

// Получение информации о пользователе Telegram по ID
export const getTelegramUserInfo = async (telegramId: number): Promise<{ firstName?: string; lastName?: string; username?: string } | null> => {
  if (!bot) {
    return null;
  }

  try {
    // Получаем информацию о пользователе через getChat
    // Но это работает только если пользователь уже взаимодействовал с ботом
    // Альтернативно можно хранить информацию при /start
    const chat = await bot.getChat(telegramId);
    
    return {
      firstName: (chat as any).first_name,
      lastName: (chat as any).last_name,
      username: (chat as any).username,
    };
  } catch (error) {
    console.error('❌ Ошибка при получении информации о пользователе Telegram:', error);
    return null;
  }
};

