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
  // Вспомогательная функция для преобразования DECIMAL строк в числа
  private static transformOperation(operation: any): IOperation {
    return {
      ...operation,
      amount: Number(operation.amount),
      timestamp: operation.timestamp ? Number(operation.timestamp) : undefined,
    };
  }

  static async find(filter: any): Promise<IOperation[]> {
    if (!pool) {
      throw new Error('Database pool is not initialized');
    }

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
    
    query += ' ORDER BY date DESC, timestamp DESC';
    
    // Добавляем пагинацию, если указана
    // MySQL2 не всегда корректно работает с параметрами для LIMIT/OFFSET,
    // поэтому используем числа напрямую (они уже валидированы через parseInt)
    if (filter.skip !== undefined && filter.limit !== undefined) {
      const limitNum = parseInt(String(filter.limit), 10);
      const skipNum = parseInt(String(filter.skip), 10);
      // Используем числа напрямую, так как они уже валидированы
      query += ` LIMIT ${limitNum} OFFSET ${skipNum}`;
    }
    
    const [rows] = await pool.execute(query, params);
    return (rows as any[]).map(this.transformOperation);
  }

  static async countDocuments(filter: any): Promise<number> {
    if (!pool) {
      throw new Error('Database pool is not initialized');
    }

    let query = 'SELECT COUNT(*) as count FROM operations WHERE user = ?';
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
    
    const [rows] = await pool.execute(query, params);
    return (rows as any[])[0]?.count || 0;
  }

  static async findById(id: string): Promise<IOperation | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM operations WHERE id = ?',
      [id]
    );
    const ops = rows as any[];
    return ops[0] ? this.transformOperation(ops[0]) : null;
  }

  static async create(data: IOperation): Promise<IOperation> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO operations (id, title, titleKey, amount, category, categoryKey, date, timestamp, type, fromAccount, toAccount, currency, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.title, data.titleKey || null, data.amount, data.category, data.categoryKey || null, data.date, data.timestamp || null, data.type, data.fromAccount || null, data.toAccount || null, data.currency || 'RUB', data.user]
    );
    return this.transformOperation({ ...data, id });
  }

  static async findByIdAndUpdate(id: string, data: Partial<IOperation>): Promise<IOperation | null> {
    const sets: string[] = [];
    const values: any[] = [];

    // Поля, которые нельзя обновлять (вычисляемые или системные)
    const excludedFields = ['id', 'user', 'convertedAmount', 'convertedCurrency', 'convertedCurrencyCode', 'itemType'];

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

  static async createMany(operations: IOperation[]): Promise<IOperation[]> {
    if (operations.length === 0) {
      return [];
    }

    // Используем транзакцию для атомарности
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const createdOperations: IOperation[] = [];

      for (const data of operations) {
        const id = uuidv4();
        await connection.execute(
          'INSERT INTO operations (id, title, titleKey, amount, category, categoryKey, date, timestamp, type, fromAccount, toAccount, currency, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            data.title,
            data.titleKey || null,
            data.amount,
            data.category,
            data.categoryKey || null,
            data.date,
            data.timestamp || null,
            data.type,
            data.fromAccount || null,
            data.toAccount || null,
            data.currency || 'RUB',
            data.user
          ]
        );
        createdOperations.push(this.transformOperation({ ...data, id }));
      }

      await connection.commit();
      return createdOperations;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default OperationModel;
