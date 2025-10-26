import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id?: string;
  name: string;
  email: string;
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
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, userData.name, userData.email, hashedPassword]
    );

    return { ...userData, id, password: hashedPassword };
  }

  static async findOne(filter: { email: string }): Promise<IUser | null> {
    let query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [filter.email]);
    const users = rows as IUser[];
    return users[0] || null;
  }

  static async findById(id: string): Promise<IUser | null> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, createdAt FROM users WHERE id = ?',
      [id]
    );
    const users = rows as IUser[];
    return users[0] || null;
  }

  static async matchPassword(enteredPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
}

export default UserModel;
