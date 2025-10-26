import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IBudget {
  id?: string;
  category: string;
  spent: number;
  budget: number;
  color: string;
  user: string;
  createdAt?: Date;
}

class BudgetModel {
  static async find(filter: { user: string }): Promise<IBudget[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE user = ?',
      [filter.user]
    );
    return rows as IBudget[];
  }

  static async findById(id: string): Promise<IBudget | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE id = ?',
      [id]
    );
    const budgets = rows as IBudget[];
    return budgets[0] || null;
  }

  static async create(data: IBudget): Promise<IBudget> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO budgets (id, category, spent, budget, color, user) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.category, data.spent, data.budget, data.color, data.user]
    );
    return { ...data, id };
  }

  static async findByIdAndUpdate(id: string, data: Partial<IBudget>): Promise<IBudget | null> {
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
      `UPDATE budgets SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async findByIdAndDelete(id: string): Promise<void> {
    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
  }
}

export default BudgetModel;
