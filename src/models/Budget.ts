import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { BudgetDTO, CreateBudgetRequest, UpdateBudgetRequest } from '../types/database';

class BudgetModel {
  // Вспомогательная функция для преобразования DECIMAL строк в числа
  private static transformBudget(budget: any): BudgetDTO {
    return {
      ...budget,
      spent: Number(budget.spent),
      budget: Number(budget.budget),
    };
  }

  static async find(filter: { userId: string }): Promise<BudgetDTO[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE userId = ?',
      [filter.userId]
    );
    return (rows as any[]).map(this.transformBudget);
  }

  static async findById(id: string): Promise<BudgetDTO | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE id = ?',
      [id]
    );
    const budgets = rows as any[];
    return budgets[0] ? this.transformBudget(budgets[0]) : null;
  }

  static async create(data: CreateBudgetRequest & { userId: string }): Promise<BudgetDTO> {
    console.log('📊 BudgetModel.create called with:', data);
    const id = uuidv4();
    console.log('📊 Generated budget ID:', id);
    console.log('📊 Executing SQL INSERT with params:', [id, data.categoryId, data.category, data.spent, data.budget, data.color, data.userId]);

    try {
      await pool.execute(
        'INSERT INTO budgets (id, categoryId, category, spent, budget, color, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, data.categoryId, data.category, data.spent, data.budget, data.color, data.userId]
      );
      console.log('📊 SQL INSERT executed successfully');
      const result = this.transformBudget({ ...data, id });
      console.log('📊 Budget created and transformed:', result);
      return result;
    } catch (sqlError: any) {
      console.error('📊 SQL INSERT failed:', sqlError.message);
      console.error('📊 SQL Error details:', {
        code: sqlError.code,
        errno: sqlError.errno,
        sqlState: sqlError.sqlState
      });
      throw sqlError;
    }
  }

  static async findByIdAndUpdate(id: string, data: UpdateBudgetRequest): Promise<BudgetDTO | null> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'userId') {
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
