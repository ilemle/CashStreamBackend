import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { OperationDTO, CreateOperationRequest } from '../types/database';

class OperationModel {
  // Вспомогательная функция для преобразования DECIMAL строк в числа
  private static transformOperation(operation: any): OperationDTO {
    return {
      ...operation,
      amount: Number(operation.amount),
      timestamp: operation.timestamp ? Number(operation.timestamp) : undefined,
    };
  }

  static async find(filter: any): Promise<OperationDTO[]> {
    if (!pool) {
      throw new Error('Database pool is not initialized');
    }

    // JOIN для получения названий категорий из translations
    const language = filter.language || 'ru'; // Язык по умолчанию
    let query = `
      SELECT 
        o.*,
        COALESCE(ct.name, c.nameKey) as categoryName,
        COALESCE(st.name, s.nameKey) as subcategoryName,
        CASE 
          WHEN COALESCE(st.name, s.nameKey) IS NOT NULL THEN CONCAT(COALESCE(ct.name, c.nameKey), ' > ', COALESCE(st.name, s.nameKey))
          ELSE COALESCE(ct.name, c.nameKey)
        END as category
      FROM operations o
      LEFT JOIN categories c ON o.categoryId = c.id
      LEFT JOIN translations ct ON ct.entityType = 'category' 
        AND ct.entityId = c.id 
        AND ct.language = ?
      LEFT JOIN subcategories s ON o.subcategoryId = s.id
      LEFT JOIN translations st ON st.entityType = 'subcategory' 
        AND st.entityId = s.id 
        AND st.language = ?
      WHERE o.userId = ?
    `;
    const params: any[] = [language, language, filter.userId];
    
    // Добавляем фильтрацию по датам, если они переданы
    if (filter.date) {
      if (filter.date.$gte) {
        query += ' AND o.date >= ?';
        params.push(filter.date.$gte);
      }
      if (filter.date.$lte) {
        query += ' AND o.date <= ?';
        params.push(filter.date.$lte);
      }
    }
    
    query += ' ORDER BY o.date DESC, o.timestamp DESC';
    
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

    let query = 'SELECT COUNT(*) as count FROM operations WHERE userId = ?';
    const params: any[] = [filter.userId];
    
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

  static async findById(id: string, language: string = 'ru'): Promise<OperationDTO | null> {
    const [rows] = await pool.execute(
      `SELECT 
        o.*,
        COALESCE(ct.name, c.nameKey) as categoryName,
        COALESCE(st.name, s.nameKey) as subcategoryName,
        CASE 
          WHEN COALESCE(st.name, s.nameKey) IS NOT NULL THEN CONCAT(COALESCE(ct.name, c.nameKey), ' > ', COALESCE(st.name, s.nameKey))
          ELSE COALESCE(ct.name, c.nameKey)
        END as category
      FROM operations o
      LEFT JOIN categories c ON o.categoryId = c.id
      LEFT JOIN translations ct ON ct.entityType = 'category' 
        AND ct.entityId = c.id 
        AND ct.language = ?
      LEFT JOIN subcategories s ON o.subcategoryId = s.id
      LEFT JOIN translations st ON st.entityType = 'subcategory' 
        AND st.entityId = s.id 
        AND st.language = ?
      WHERE o.id = ?`,
      [language, language, id]
    );
    const ops = rows as any[];
    return ops[0] ? this.transformOperation(ops[0]) : null;
  }

  static async create(data: CreateOperationRequest & { userId: string }, language: string = 'ru'): Promise<OperationDTO> {
    const id = uuidv4();
    
    const insertValues = [
      id,
      data.title,
      data.amount,
      data.categoryId ?? null,
      data.subcategoryId ?? null,
      data.date,
      data.timestamp ?? null,
      data.type,
      data.fromAccount ?? null,
      data.toAccount ?? null,
      data.currency ?? 'RUB',
      data.userId
    ];
    
    await pool.execute(
      'INSERT INTO operations (id, title, amount, categoryId, subcategoryId, date, timestamp, type, fromAccount, toAccount, currency, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      insertValues
    );
    // Получаем созданную операцию с JOIN для названий категорий
    const created = await this.findById(id, language);
    if (created) {
      return created;
    }
    // Fallback если не удалось получить с JOIN
    return this.transformOperation({ ...data, id });
  }

  static async findByIdAndUpdate(id: string, data: Partial<CreateOperationRequest>, language: string = 'ru'): Promise<OperationDTO | null> {
    const sets: string[] = [];
    const values: any[] = [];

    // Поля, которые нельзя обновлять (вычисляемые или системные)
    const excludedFields = ['id', 'userId', 'convertedAmount', 'convertedCurrency', 'convertedCurrencyCode', 'itemType', 'categoryName', 'subcategoryName', 'category'];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && !excludedFields.includes(key)) {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (sets.length === 0) {
      return this.findById(id, language);
    }

    values.push(id);
    await pool.execute(
      `UPDATE operations SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id, language);
  }

  static async findByIdAndDelete(id: string): Promise<void> {
    await pool.execute('DELETE FROM operations WHERE id = ?', [id]);
  }

  static async createMany(operations: (CreateOperationRequest & { userId: string })[], language: string = 'ru'): Promise<OperationDTO[]> {
    if (operations.length === 0) {
      return [];
    }

    // Используем транзакцию для атомарности
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const createdOperations: OperationDTO[] = [];

      for (const data of operations) {
        const id = uuidv4();
        
        const insertValues = [
          id,
          data.title,
          data.amount,
          data.categoryId ?? null,
          data.subcategoryId ?? null,
          data.date,
          data.timestamp ?? null,
          data.type,
          data.fromAccount ?? null,
          data.toAccount ?? null,
          data.currency ?? 'RUB',
          data.userId
        ];
        
        await connection.execute(
          'INSERT INTO operations (id, title, amount, categoryId, subcategoryId, date, timestamp, type, fromAccount, toAccount, currency, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          insertValues
        );
        // Получаем созданную операцию с переводами
        const created = await this.findById(id, language);
        if (created) {
          createdOperations.push(created);
        } else {
          createdOperations.push(this.transformOperation({ ...data, id }));
        }
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
