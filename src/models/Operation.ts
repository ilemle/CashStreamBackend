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
  type: 'income' | 'expense' | 'transfer';
  // Для переводов (transfer)
  fromAccount?: string;
  toAccount?: string;
  currency?: string;  // Валюта операции (RUB, USD, EUR и т.д.)
  user: string;
  createdAt?: Date;
}

class OperationModel {
  static async find(filter: any): Promise<IOperation[]> {
    let query = 'SELECT * FROM operations WHERE user = ?';
    const params: any[] = [filter.user];
    
    // Добавляем фильтрацию по датам, если они переданы
    if (filter.date) {
      if (filter.date.$gte) {
        query += ' AND date >= ?';
        params.push(filter.date.$gte);
      }
      if (filter.date.$lte) {
        query += ' AND date <= ?';
        params.push(filter.date.$lte);
      }
    }
    
    query += ' ORDER BY date DESC';
    
    const [rows] = await pool.execute(query, params);
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
      'INSERT INTO operations (id, title, titleKey, amount, category, categoryKey, date, timestamp, type, fromAccount, toAccount, currency, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.title, data.titleKey || null, data.amount, data.category, data.categoryKey || null, data.date, data.timestamp || null, data.type, data.fromAccount || null, data.toAccount || null, data.currency || 'RUB', data.user]
    );
    return { ...data, id };
  }

  static async findByIdAndUpdate(id: string, data: Partial<IOperation>): Promise<IOperation | null> {
    const sets: string[] = [];
    const values: any[] = [];

    // Поля, которые нельзя обновлять (вычисляемые или системные)
    const excludedFields = ['id', 'user', 'convertedAmount', 'convertedCurrency', 'convertedCurrencyCode'];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && !excludedFields.includes(key)) {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (sets.length === 0) {
      return this.findById(id);
    }

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
