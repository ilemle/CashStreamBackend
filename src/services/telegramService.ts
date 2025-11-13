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

    // Обработка команды /start (с параметром или без)
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from?.id;
      const firstName = msg.from?.first_name || 'Пользователь';
      const lastName = msg.from?.last_name || '';
      const username = msg.from?.username || '';
      const startParam = match?.[1]; // Параметр после /start (например, "auth" или "auth_TOKEN")
      
      console.log(`📱 Получена команда /start от пользователя ${firstName} (ID: ${chatId}, Telegram ID: ${telegramId}, параметр: ${startParam || 'нет'})`);
      
      if (telegramId) {
        try {
          const User = (await import('../models/User')).default;
          const TelegramAuthSession = (await import('../models/TelegramAuthSession')).default;
          
          // Проверяем, существует ли пользователь
          const existingUser = await User.findOne({ telegramId: Number(telegramId) });
          
          const { pool } = await import('../config/database');
          
          // Если открытие из приложения с токеном (startParam начинается с "auth_")
          if (startParam && startParam.startsWith('auth_')) {
            const sessionToken = startParam.substring(5); // Убираем "auth_"
            
            // Проверяем сессию
            const session = await TelegramAuthSession.findByToken(sessionToken);
            
            if (!session) {
              bot?.sendMessage(
                chatId,
                `❌ Сессия истекла или не найдена.\n\nПожалуйста, вернитесь в приложение и попробуйте снова.`,
                {
                  disable_web_page_preview: true
                }
              );
              return;
            }
            
            // Обновляем telegramId в сессии
            await pool.execute(
              'UPDATE telegram_auth_sessions SET telegramId = ? WHERE sessionToken = ?',
              [telegramId, sessionToken]
            );
            
            // Показываем кнопки с токеном
            
            if (!existingUser) {
              // Новый пользователь - показываем кнопку "Зарегистрироваться"
              bot?.sendMessage(
                chatId,
                `👋 Привет, ${firstName}!\n\nДобро пожаловать в CashStream!\n\nНажмите кнопку ниже, чтобы зарегистрироваться:`,
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: '✅ Зарегистрироваться',
                          callback_data: `register_${sessionToken}`
                        }
                      ]
                    ]
                  },
                  disable_web_page_preview: true
                }
              );
            } else {
              // Существующий пользователь - показываем кнопку "Подтвердить авторизацию"
              bot?.sendMessage(
                chatId,
                `👋 Привет, ${existingUser.username || firstName}!\n\nПодтвердите авторизацию в приложении CashStream:`,
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: '✅ Подтвердить авторизацию',
                          callback_data: `auth_${sessionToken}`
                        }
                      ]
                    ]
                  },
                  disable_web_page_preview: true
                }
              );
            }
            return; // Не выполняем стандартную логику
          }
          
          // Стандартная логика для /start без параметра
          if (!existingUser) {
            // Создаем нового пользователя
            const name = firstName 
              ? (lastName ? `${firstName} ${lastName}` : firstName)
              : (username || 'Telegram User');
            
            const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
            
            const newUser = await User.create({
              username: name,
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
            console.log(`✅ Пользователь уже существует: ${existingUser.username} (telegramId: ${telegramId}), обновлена активность`);
          }
          
          // Отправляем сообщение об успешной регистрации
          bot?.sendMessage(
            chatId, 
            `✅ Регистрация успешна!\n\nПривет, ${firstName}! 👋\n\nДобро пожаловать в CashStream!\n\nТеперь вернитесь в приложение CashStream для завершения авторизации.`,
            {
              disable_web_page_preview: true
            }
          );
        } catch (error) {
          console.error('❌ Ошибка при создании пользователя через Telegram:', error);
        }
      }
    });
    
    // Обработка нажатий на inline кнопки
    bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const telegramId = query.from?.id;
      const data = query.data; // 'register_TOKEN' или 'auth_TOKEN' или старые форматы
      
      if (!chatId || !telegramId) {
        return;
      }
      
      try {
        const User = (await import('../models/User')).default;
        const TelegramAuthSession = (await import('../models/TelegramAuthSession')).default;
        const { pool } = await import('../config/database');
        
        // Парсим callback_data: может быть "register_TOKEN" или "auth_TOKEN"
        let action: string;
        let sessionToken: string | null = null;
        
        if (data?.includes('_')) {
          const parts = data.split('_');
          action = parts[0];
          sessionToken = parts.slice(1).join('_'); // На случай, если токен содержит подчеркивания
        } else {
          action = data || '';
        }
        
        if (action === 'register') {
          // Регистрация нового пользователя
          const existingUser = await User.findOne({ telegramId: Number(telegramId) });
          
          if (existingUser) {
            // Пользователь уже существует
            await bot?.answerCallbackQuery(query.id, {
              text: 'Вы уже зарегистрированы!',
              show_alert: false
            });
            
            // Обновляем активность
            await pool.execute(
              'UPDATE users SET lastTelegramActivity = NOW() WHERE id = ?',
              [existingUser.id]
            );
            
            bot?.editMessageText(
              `✅ Вы уже зарегистрированы, ${existingUser.username || query.from.first_name}!\n\nВернитесь в приложение CashStream для завершения авторизации.`,
              {
                chat_id: chatId,
                message_id: query.message?.message_id
              }
            );
            return;
          }
          
          // Создаем нового пользователя
          const firstName = query.from.first_name || 'Пользователь';
          const lastName = query.from.last_name || '';
          const username = query.from.username || '';
          const name = firstName 
            ? (lastName ? `${firstName} ${lastName}` : firstName)
            : (username || 'Telegram User');
          
          const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
          
          const newUser = await User.create({
            username: name,
            telegramId: Number(telegramId),
            password: randomPassword
          } as any);
          
          // Если есть токен сессии, обновляем его
          if (sessionToken) {
            await TelegramAuthSession.updateUserId(sessionToken, newUser.id!);
            await pool.execute(
              'UPDATE telegram_auth_sessions SET telegramId = ? WHERE sessionToken = ?',
              [telegramId, sessionToken]
            );
          } else {
            // Старый способ - обновляем время последней активности
            await pool.execute(
              'UPDATE users SET lastTelegramActivity = NOW() WHERE id = ?',
              [newUser.id]
            );
          }
          
          await bot?.answerCallbackQuery(query.id, {
            text: '✅ Регистрация успешна!',
            show_alert: false
          });
          
          bot?.editMessageText(
            `✅ Регистрация успешна!\n\nПривет, ${name}! 👋\n\nДобро пожаловать в CashStream!\n\nТеперь вернитесь в приложение CashStream для завершения авторизации.`,
            {
              chat_id: chatId,
              message_id: query.message?.message_id
            }
          );
          
          console.log(`✅ Пользователь зарегистрирован через кнопку: ${name} (telegramId: ${telegramId})`);
        } else if (action === 'auth') {
          // Подтверждение авторизации для существующего пользователя
          const existingUser = await User.findOne({ telegramId: Number(telegramId) });
          
          if (!existingUser) {
            await bot?.answerCallbackQuery(query.id, {
              text: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь.',
              show_alert: true
            });
            return;
          }
          
          // Если есть токен сессии, обновляем его
          if (sessionToken) {
            await TelegramAuthSession.updateUserId(sessionToken, existingUser.id!);
            await pool.execute(
              'UPDATE telegram_auth_sessions SET telegramId = ? WHERE sessionToken = ?',
              [telegramId, sessionToken]
            );
          } else {
            // Старый способ - обновляем время последней активности
            await pool.execute(
              'UPDATE users SET lastTelegramActivity = NOW() WHERE id = ?',
              [existingUser.id]
            );
          }
          
          await bot?.answerCallbackQuery(query.id, {
            text: '✅ Авторизация подтверждена!',
            show_alert: false
          });
          
          bot?.editMessageText(
            `✅ Авторизация подтверждена!\n\nПривет, ${existingUser.username || query.from.first_name}!\n\nВернитесь в приложение CashStream.`,
            {
              chat_id: chatId,
              message_id: query.message?.message_id
            }
          );
          
          console.log(`✅ Авторизация подтверждена через кнопку: ${existingUser.username} (telegramId: ${telegramId})`);
        }
      } catch (error) {
        console.error('❌ Ошибка при обработке callback_query:', error);
        await bot?.answerCallbackQuery(query.id, {
          text: 'Произошла ошибка. Попробуйте позже.',
          show_alert: true
        });
      }
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
  // Добавляем параметр start=auth, чтобы бот знал, что открытие из приложения
  return `tg://resolve?domain=${username}&start=auth`;
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

