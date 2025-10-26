import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IOperation {
  id?: string;
  title: string;
  titleKey?: string;
  amount: number;
  category: string;
  categoryKey?: string;
  date: Date | string;
  timestamp?: number;
  type: 'income' | 'expense';
  user: string;
  createdAt?: Date;
}

class OperationModel {
  static async find(filter: { user: string }): Promise<IOperation[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM operations WHERE user = ? ORDER BY date DESC',
      [filter.user]
    );
    return rows as IOperation[];
  }

  static async findById(id: string): Promise<IOperation | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM operations WHERE id = ?',
      [id]
    );
    const ops = rows as IOperation[];
    return ops[0] || null;
  }

  static async create(data: IOperation): Promise<IOperation> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO operations (id, title, titleKey, amount, category, categoryKey, date, timestamp, type, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.title, data.titleKey || null, data.amount, data.category, data.categoryKey || null, data.date, data.timestamp || null, data.type, data.user]
    );
    return { ...data, id };
  }

  static async findByIdAndUpdate(id: string, data: Partial<IOperation>): Promise<IOperation | null> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'user') {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    values.push(id);
    await pool.execute(
      `UPDATE operations SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async findByIdAndDelete(id: string): Promise<void> {
    await pool.execute('DELETE FROM operations WHERE id = ?', [id]);
  }
}

export default OperationModel;
