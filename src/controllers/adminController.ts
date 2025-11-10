import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { pool } from '../config/database';
import { getTelegramUserInfo } from '../services/telegramService';

// Получение списка всех пользователей с пагинацией
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('📋 [Admin] Getting all users...');
    console.log('📋 [Admin] Request URL:', req.url);
    console.log('📋 [Admin] Request method:', req.method);
    
    // Проверяем подключение к БД
    if (!pool) {
      console.error('❌ [Admin] Database pool is not initialized');
      res.status(503).json({
        success: false,
        message: 'Database connection is not available. Please check database configuration.'
      });
      return;
    }
    
    // Получаем параметры пагинации из query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Валидация параметров
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Максимум 100 на странице
    
    const result = await User.findAll(validPage, validLimit);
    console.log(`✅ [Admin] Found ${result.total} users (page ${result.page}, limit ${result.limit})`);
    
    // Преобразуем даты в строки для JSON и получаем информацию о Telegram пользователях
    const formattedUsers = await Promise.all(result.users.map(async (user) => {
      let telegramUsername: string | null = null;
      
      // Если есть telegramId, получаем информацию о пользователе из Telegram
      if (user.telegramId) {
        try {
          const telegramInfo = await getTelegramUserInfo(user.telegramId);
          telegramUsername = telegramInfo?.username || null;
        } catch (error) {
          console.error(`Failed to get Telegram info for user ${user.id}:`, error);
        }
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
        telegramId: user.telegramId || null,
        telegramUsername: telegramUsername,
        createdAt: user.createdAt 
          ? (user.createdAt instanceof Date 
            ? user.createdAt.toISOString() 
            : new Date(user.createdAt).toISOString())
          : null
      };
    }));
    
    console.log('✅ [Admin] Sending response with', formattedUsers.length, 'users');
    
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        data: formattedUsers,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    }
  } catch (err: any) {
    console.error('❌ [Admin] Get all users error:', err);
    console.error('❌ [Admin] Error name:', err.name);
    console.error('❌ [Admin] Error message:', err.message);
    console.error('❌ [Admin] Error code:', err.code);
    console.error('❌ [Admin] Error stack:', err.stack);
    
    // Передаем ошибку в errorHandler middleware
    if (!res.headersSent) {
      next(err);
    }
  }
};

