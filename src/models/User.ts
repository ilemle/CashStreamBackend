import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  createdAt?: Date;
}

class UserModel {
  static async create(userData: IUser): Promise<IUser> {
    // Генерируем UUID
    const id = uuidv4();
    
    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    await pool.execute(
      'INSERT INTO users (id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [id, userData.name, userData.email || null, userData.phone || null, hashedPassword]
    );

    return { ...userData, id, password: hashedPassword };
  }

  static async findOne(filter: { email?: string; phone?: string }): Promise<IUser | null> {
    let query = 'SELECT * FROM users WHERE ';
    const params: any[] = [];
    
    if (filter.email) {
      query += 'email = ?';
      params.push(filter.email);
    } else if (filter.phone) {
      query += 'phone = ?';
      params.push(filter.phone);
    } else {
      return null;
    }
    
    const [rows] = await pool.execute(query, params);
    const users = rows as IUser[];
    return users[0] || null;
  }

  static async findById(id: string): Promise<IUser | null> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, createdAt FROM users WHERE id = ?',
      [id]
    );
    const users = rows as IUser[];
    return users[0] || null;
  }

  static async matchPassword(enteredPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  static async findAll(page: number = 1, limit: number = 10): Promise<{ users: IUser[]; total: number; page: number; limit: number; totalPages: number }> {
    // Гарантируем, что значения - целые числа
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(Math.floor(limit), 100));
    const offset = (validPage - 1) * validLimit;
    
    // Получаем общее количество пользователей
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = (countRows as any[])[0].total;
    
    // Получаем пользователей с пагинацией
    // MySQL2 не поддерживает параметры для LIMIT и OFFSET в prepared statements,
    // поэтому используем числа напрямую (значения уже валидированы и безопасны)
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, createdAt FROM users ORDER BY createdAt DESC LIMIT ${validLimit} OFFSET ${offset}`
    );
    
    const users = rows as IUser[];
    const totalPages = Math.ceil(total / validLimit);
    
    return {
      users,
      total,
      page: validPage,
      limit: validLimit,
      totalPages
    };
  }
}

export default UserModel;
