import { pool } from '../config/database';

export interface IBudget {
  id?: number;
  category: string;
  spent: number;
  budget: number;
  color: string;
  user: number;
  createdAt?: Date;
}

class BudgetModel {
  static async find(filter: { user: string | number }): Promise<IBudget[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE user = ?',
      [filter.user]
    );
    return rows as IBudget[];
  }

  static async findById(id: string | number): Promise<IBudget | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE id = ?',
      [id]
    );
    const budgets = rows as IBudget[];
    return budgets[0] || null;
  }

  static async create(data: IBudget): Promise<IBudget> {
    const [result] = await pool.execute(
      'INSERT INTO budgets (category, spent, budget, color, user) VALUES (?, ?, ?, ?, ?)',
      [data.category, data.spent, data.budget, data.color, data.user]
    );
    const insertResult = result as any;
    return { ...data, id: insertResult.insertId };
  }

  static async findByIdAndUpdate(id: string | number, data: Partial<IBudget>): Promise<IBudget | null> {
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

  static async findByIdAndDelete(id: string | number): Promise<void> {
    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
  }
}

export default BudgetModel;
