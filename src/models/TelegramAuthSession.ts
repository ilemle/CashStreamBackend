import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface ITelegramAuthSession {
  id?: string;
  sessionToken: string;
  telegramId: number;
  userId?: string | null;
  createdAt?: Date;
  expiresAt: Date;
  used?: boolean;
}

export default class TelegramAuthSession {
  // Создание новой сессии
  static async create(data: {
    sessionToken: string;
    telegramId: number;
    expiresAt: Date;
  }): Promise<ITelegramAuthSession> {
    const id = uuidv4();
    
    await pool.execute(
      `INSERT INTO telegram_auth_sessions (id, sessionToken, telegramId, expiresAt, used)
       VALUES (?, ?, ?, ?, FALSE)`,
      [id, data.sessionToken, data.telegramId, data.expiresAt]
    );
    
    return {
      id,
      sessionToken: data.sessionToken,
      telegramId: data.telegramId,
      expiresAt: data.expiresAt,
      used: false
    };
  }
  
  // Поиск сессии по токену
  static async findByToken(sessionToken: string): Promise<ITelegramAuthSession | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM telegram_auth_sessions 
       WHERE sessionToken = ? 
       AND expiresAt > NOW() 
       AND used = FALSE`,
      [sessionToken]
    );
    
    const sessions = rows as ITelegramAuthSession[];
    return sessions.length > 0 ? sessions[0] : null;
  }
  
  // Обновление userId в сессии
  static async updateUserId(sessionToken: string, userId: string): Promise<void> {
    await pool.execute(
      'UPDATE telegram_auth_sessions SET userId = ? WHERE sessionToken = ?',
      [userId, sessionToken]
    );
  }
  
  // Отметка сессии как использованной
  static async markAsUsed(sessionToken: string): Promise<void> {
    await pool.execute(
      'UPDATE telegram_auth_sessions SET used = TRUE WHERE sessionToken = ?',
      [sessionToken]
    );
  }
  
  // Удаление истекших сессий
  static async deleteExpired(): Promise<void> {
    await pool.execute(
      'DELETE FROM telegram_auth_sessions WHERE expiresAt < NOW()'
    );
  }
  
  // Удаление сессии по токену
  static async deleteByToken(sessionToken: string): Promise<void> {
    await pool.execute(
      'DELETE FROM telegram_auth_sessions WHERE sessionToken = ?',
      [sessionToken]
    );
  }
}

