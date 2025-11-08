import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IDebt {
  id?: string;
  title: string;
  amount: number;
  currency?: string;
  type: 'lent' | 'borrowed'; // lent - я одолжил, borrowed - я взял в долг
  person: string; // Имя человека/организации
  dueDate: Date | string; // Дата возврата
  isPaid: boolean;
  paidDate?: Date | string;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class DebtModel {
  // Вспомогательная функция для преобразования DECIMAL строк в числа
  private static transformDebt(debt: any): IDebt {
    return {
      ...debt,
      amount: Number(debt.amount),
      isPaid: Boolean(debt.isPaid),
    };
  }

  static async find(filter: { user: string; isPaid?: boolean }): Promise<IDebt[]> {
    let query = 'SELECT * FROM debts WHERE user = ?';
    const params: any[] = [filter.user];
    
    if (filter.isPaid !== undefined) {
      query += ' AND isPaid = ?';
      params.push(filter.isPaid ? 1 : 0);
    }
    
    query += ' ORDER BY dueDate ASC, createdAt DESC';
    
    const [rows] = await pool.execute(query, params);
    return (rows as any[]).map(this.transformDebt);
  }

  static async findById(id: string): Promise<IDebt | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM debts WHERE id = ?',
      [id]
    );
    const debts = rows as any[];
    return debts[0] ? this.transformDebt(debts[0]) : null;
  }

  static async create(data: IDebt): Promise<IDebt> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO debts (id, title, amount, currency, type, person, dueDate, isPaid, paidDate, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.title,
        data.amount,
        data.currency || 'RUB',
        data.type,
        data.person,
        data.dueDate,
        data.isPaid ? 1 : 0,
        data.paidDate || null,
        data.user
      ]
    );
    return this.transformDebt({ ...data, id });
  }

  static async findByIdAndUpdate(id: string, data: Partial<IDebt>): Promise<IDebt | null> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'user') {
        if (key === 'isPaid') {
          sets.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          sets.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (sets.length === 0) {
      return this.findById(id);
    }

    // Добавляем updatedAt
    sets.push('updatedAt = NOW()');
    values.push(id);
    
    await pool.execute(
      `UPDATE debts SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async findByIdAndDelete(id: string): Promise<void> {
    await pool.execute('DELETE FROM debts WHERE id = ?', [id]);
  }

  // Получить просроченные долги
  static async findOverdue(userId: string): Promise<IDebt[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM debts 
       WHERE user = ? AND isPaid = 0 AND dueDate < CURDATE() 
       ORDER BY dueDate ASC`,
      [userId]
    );
    return (rows as any[]).map(this.transformDebt);
  }
}

export default DebtModel;

