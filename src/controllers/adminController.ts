import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { pool } from '../config/database';

// Получение списка всех пользователей
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
    
    const users = await User.findAll();
    console.log(`✅ [Admin] Found ${users.length} users`);
    
    // Преобразуем даты в строки для JSON
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt 
        ? (user.createdAt instanceof Date 
          ? user.createdAt.toISOString() 
          : new Date(user.createdAt).toISOString())
        : null
    }));
    
    console.log('✅ [Admin] Sending response with', formattedUsers.length, 'users');
    
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        data: formattedUsers,
        count: formattedUsers.length
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

