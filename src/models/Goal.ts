import { pool } from '../config/database';

export interface IGoal {
  id?: number;
  title: string;
  target: number;
  current: number;
  deadline: string;
  user: number;
  createdAt?: Date;
}

class GoalModel {
  static async find(filter: { user: string | number }): Promise<IGoal[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM goals WHERE user = ?',
      [filter.user]
    );
    return rows as IGoal[];
  }

  static async findById(id: string | number): Promise<IGoal | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM goals WHERE id = ?',
      [id]
    );
    const goals = rows as IGoal[];
    return goals[0] || null;
  }

  static async create(data: IGoal): Promise<IGoal> {
    const [result] = await pool.execute(
      'INSERT INTO goals (title, target, current, deadline, user) VALUES (?, ?, ?, ?, ?)',
      [data.title, data.target, data.current, data.deadline, data.user]
    );
    const insertResult = result as any;
    return { ...data, id: insertResult.insertId };
  }

  static async findByIdAndUpdate(id: string | number, data: Partial<IGoal>): Promise<IGoal | null> {
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

  static async findByIdAndDelete(id: string | number): Promise<void> {
    await pool.execute('DELETE FROM goals WHERE id = ?', [id]);
  }
}

export default GoalModel;
