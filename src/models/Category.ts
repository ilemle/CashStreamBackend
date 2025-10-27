import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface ISubcategory {
  id: string;
  name: string;
  icon?: string;
}

export interface ICategory {
  id?: string;
  name: string;
  icon?: string;
  subcategories?: ISubcategory[];
  isSystem: boolean; // Системная категория или пользовательская
  userId?: string; // Для пользовательских категорий
  createdAt?: Date;
}

class CategoryModel {
  // Получить системные категории
  static async getSystemCategories(): Promise<ICategory[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE isSystem = TRUE ORDER BY name',
      []
    );
    return rows as ICategory[];
  }

  // Получить пользовательские категории
  static async getUserCategories(userId: string): Promise<ICategory[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE userId = ? ORDER BY name',
      [userId]
    );
    return rows as ICategory[];
  }

  // Получить категории с подкатегориями
  static async getCategoryWithSubcategories(categoryId: string): Promise<ICategory | null> {
    // Получить основную категорию
    const [categoryRows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    const categories = categoryRows as ICategory[];
    
    if (!categories[0]) {
      return null;
    }

    // Получить подкатегории для этой категории
    const [subcategoryRows] = await pool.execute(
      'SELECT * FROM subcategories WHERE categoryId = ? ORDER BY name',
      [categoryId]
    );
    const subcategories = subcategoryRows as ISubcategory[];

    return {
      ...categories[0],
      subcategories
    };
  }

  // Создать пользовательскую категорию
  static async createCategory(data: Omit<ICategory, 'id'>): Promise<ICategory> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO categories (id, name, icon, isSystem, userId) VALUES (?, ?, ?, ?, ?)',
      [id, data.name, data.icon || null, false, data.userId]
    );
    return { ...data, id };
  }

  // Создать подкатегорию
  static async createSubcategory(categoryId: string, name: string, icon?: string): Promise<ISubcategory> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO subcategories (id, categoryId, name, icon) VALUES (?, ?, ?, ?)',
      [id, categoryId, name, icon || null]
    );
    return { id, name, icon };
  }

  // Обновить категорию
  static async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    const sets: string[] = [];
    const values: any[] = [];

    const allowedFields = ['name', 'icon'];
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && allowedFields.includes(key)) {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (sets.length === 0) {
      return this.getCategoryWithSubcategories(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE categories SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.getCategoryWithSubcategories(id);
  }

  // Удалить категорию
  static async deleteCategory(id: string): Promise<void> {
    // Сначала удалить все подкатегории
    await pool.execute('DELETE FROM subcategories WHERE categoryId = ?', [id]);
    // Затем удалить категорию
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  }

  // Удалить подкатегорию
  static async deleteSubcategory(id: string): Promise<void> {
    await pool.execute('DELETE FROM subcategories WHERE id = ?', [id]);
  }
}

export default CategoryModel;

