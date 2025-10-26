import { pool } from '../config/database';

export interface IOperation {
  id?: number;
  title: string;
  titleKey?: string;
  amount: number;
  category: string;
  categoryKey?: string;
  date: Date | string;
  timestamp?: number;
  type: 'income' | 'expense';
  user: number;
  createdAt?: Date;
}

class OperationModel {
  static async find(filter: { user: string | number }): Promise<IOperation[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM operations WHERE user = ? ORDER BY date DESC',
      [filter.user]
    );
    return rows as IOperation[];
  }

  static async findById(id: string | number): Promise<IOperation | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM operations WHERE id = ?',
      [id]
    );
    const ops = rows as IOperation[];
    return ops[0] || null;
  }

  static async create(data: IOperation): Promise<IOperation> {
    const [result] = await pool.execute(
      'INSERT INTO operations (title, titleKey, amount, category, categoryKey, date, timestamp, type, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.title, data.titleKey, data.amount, data.category, data.categoryKey, data.date, data.timestamp, data.type, data.user]
    );
    const insertResult = result as any;
    return { ...data, id: insertResult.insertId };
  }

  static async findByIdAndUpdate(id: string | number, data: Partial<IOperation>): Promise<IOperation | null> {
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

  static async findByIdAndDelete(id: string | number): Promise<void> {
    await pool.execute('DELETE FROM operations WHERE id = ?', [id]);
  }
}

export default OperationModel;
