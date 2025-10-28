import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IGoal {
  id?: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  user: string;
  createdAt?: Date;
}

class GoalModel {
  // Вспомогательная функция для преобразования DECIMAL строк в числа
  private static transformGoal(goal: any): IGoal {
    return {
      ...goal,
      target: Number(goal.target),
      current: Number(goal.current),
    };
  }

  static async find(filter: { user: string }): Promise<IGoal[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM goals WHERE user = ?',
      [filter.user]
    );
    return (rows as any[]).map(this.transformGoal);
  }

  static async findById(id: string): Promise<IGoal | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM goals WHERE id = ?',
      [id]
    );
    const goals = rows as any[];
    return goals[0] ? this.transformGoal(goals[0]) : null;
  }

  static async create(data: IGoal): Promise<IGoal> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO goals (id, title, target, current, deadline, user) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.title, data.target, data.current, data.deadline, data.user]
    );
    return this.transformGoal({ ...data, id });
  }

  static async findByIdAndUpdate(id: string, data: Partial<IGoal>): Promise<IGoal | null> {
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
      `UPDATE goals SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async findByIdAndDelete(id: string): Promise<void> {
    await pool.execute('DELETE FROM goals WHERE id = ?', [id]);
  }
}

export default GoalModel;
