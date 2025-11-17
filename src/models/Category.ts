import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface ISubcategory {
  id: string;
  nameKey: string; // Ключ для переводов
  name: string; // Переведенное название (из translations или nameKey как fallback)
  icon?: string;
}

export interface ICategory {
  id?: string;
  nameKey: string; // Ключ для переводов
  name: string; // Переведенное название (из translations или nameKey как fallback)
  icon?: string;
  subcategories?: ISubcategory[];
  isSystem: boolean; // Системная категория или пользовательская
  userId?: string; // Для пользовательских категорий
  createdAt?: Date;
}

class CategoryModel {
  // Получить системные категории с переводами
  static async getSystemCategories(language: string = 'ru'): Promise<ICategory[]> {
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.nameKey,
        c.icon,
        c.isSystem,
        c.userId,
        c.createdAt,
        COALESCE(t.name, c.nameKey) as name
      FROM categories c
      LEFT JOIN translations t ON t.entityType = 'category' 
        AND t.entityId = c.id 
        AND t.language = ?
      WHERE c.isSystem = TRUE 
      ORDER BY c.nameKey`,
      [language]
    );
    return rows as ICategory[];
  }

  // Получить пользовательские категории с переводами
  static async getUserCategories(userId: string, language: string = 'ru'): Promise<ICategory[]> {
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.nameKey,
        c.icon,
        c.isSystem,
        c.userId,
        c.createdAt,
        COALESCE(t.name, c.nameKey) as name
      FROM categories c
      LEFT JOIN translations t ON t.entityType = 'category' 
        AND t.entityId = c.id 
        AND t.language = ?
      WHERE c.userId = ? 
      ORDER BY c.nameKey`,
      [language, userId]
    );
    return rows as ICategory[];
  }

  // Получить категории с подкатегориями и переводами
  static async getCategoryWithSubcategories(categoryId: string, language: string = 'ru'): Promise<ICategory | null> {
    // Получить основную категорию с переводом
    const [categoryRows] = await pool.execute(
      `SELECT 
        c.id,
        c.nameKey,
        c.icon,
        c.isSystem,
        c.userId,
        c.createdAt,
        COALESCE(t.name, c.nameKey) as name
      FROM categories c
      LEFT JOIN translations t ON t.entityType = 'category' 
        AND t.entityId = c.id 
        AND t.language = ?
      WHERE c.id = ?`,
      [language, categoryId]
    );
    const categories = categoryRows as ICategory[];
    
    if (!categories[0]) {
      return null;
    }

    // Получить подкатегории с переводами
    const [subcategoryRows] = await pool.execute(
      `SELECT 
        s.id,
        s.categoryId,
        s.nameKey,
        s.icon,
        s.createdAt,
        COALESCE(t.name, s.nameKey) as name
      FROM subcategories s
      LEFT JOIN translations t ON t.entityType = 'subcategory' 
        AND t.entityId = s.id 
        AND t.language = ?
      WHERE s.categoryId = ? 
      ORDER BY s.nameKey`,
      [language, categoryId]
    );
    const subcategories = subcategoryRows as ISubcategory[];

    return {
      ...categories[0],
      subcategories
    };
  }

  // Получить все категории (системные + пользовательские) с подкатегориями и переводами
  static async getAllCategoriesWithSubcategories(userId: string | null, language: string = 'ru', operationType?: 'income' | 'expense'): Promise<ICategory[]> {
    // Получаем системные категории
    const systemCategories = await this.getSystemCategories(language);
    
    // Фильтруем по типу операции, если указан
    let filteredSystemCategories = systemCategories;
    if (operationType === 'income') {
      // Для доходов используем только категории доходов (по nameKey)
      filteredSystemCategories = systemCategories.filter(c => 
        c.nameKey.startsWith('category.salary') ||
        c.nameKey.startsWith('category.business') ||
        c.nameKey.startsWith('category.investment') ||
        c.nameKey.startsWith('category.freelance') ||
        c.nameKey.startsWith('category.bonus') ||
        c.nameKey.startsWith('category.other')
      );
    } else if (operationType === 'expense') {
      // Для расходов используем только категории расходов
      filteredSystemCategories = systemCategories.filter(c => 
        !c.nameKey.startsWith('category.salary') &&
        !c.nameKey.startsWith('category.business') &&
        !c.nameKey.startsWith('category.investment') &&
        !c.nameKey.startsWith('category.freelance') &&
        !c.nameKey.startsWith('category.bonus') &&
        !c.nameKey.startsWith('category.other')
      );
    }

    // Получаем пользовательские категории
    let userCategories: ICategory[] = [];
    if (userId) {
      userCategories = await this.getUserCategories(userId, language);
      // Добавляем подкатегории для пользовательских категорий
      for (let i = 0; i < userCategories.length; i++) {
        const categoryWithSubs = await this.getCategoryWithSubcategories(userCategories[i].id!, language);
        if (categoryWithSubs) {
          userCategories[i] = categoryWithSubs;
        }
      }
    }

    // Добавляем подкатегории для системных категорий
    for (let i = 0; i < filteredSystemCategories.length; i++) {
      const categoryWithSubs = await this.getCategoryWithSubcategories(filteredSystemCategories[i].id!, language);
      if (categoryWithSubs) {
        filteredSystemCategories[i] = categoryWithSubs;
      }
    }

    return [...filteredSystemCategories, ...userCategories];
  }

  // Создать пользовательскую категорию
  static async createCategory(data: Omit<ICategory, 'id' | 'name'>, name: string, language: string = 'ru'): Promise<ICategory> {
    const id = uuidv4();
    const nameKey = `category.user.${id}`; // Генерируем уникальный nameKey
    
    await pool.execute(
      'INSERT INTO categories (id, nameKey, icon, isSystem, userId) VALUES (?, ?, ?, ?, ?)',
      [id, nameKey, data.icon || null, false, data.userId]
    );

    // Создаем перевод для указанного языка
    await pool.execute(
      'INSERT INTO translations (id, entityType, entityId, language, name) VALUES (UUID(), ?, ?, ?, ?)',
      ['category', id, language, name]
    );

    return { ...data, id, nameKey, name };
  }

  // Создать подкатегорию
  static async createSubcategory(categoryId: string, name: string, language: string = 'ru', icon?: string): Promise<ISubcategory> {
    const id = uuidv4();
    const nameKey = `subcategory.user.${id}`; // Генерируем уникальный nameKey
    
    await pool.execute(
      'INSERT INTO subcategories (id, categoryId, nameKey, icon) VALUES (?, ?, ?, ?)',
      [id, categoryId, nameKey, icon || null]
    );

    // Создаем перевод для указанного языка
    await pool.execute(
      'INSERT INTO translations (id, entityType, entityId, language, name) VALUES (UUID(), ?, ?, ?, ?)',
      ['subcategory', id, language, name]
    );

    return { id, nameKey, name, icon };
  }

  // Обновить категорию
  static async updateCategory(id: string, data: Partial<ICategory>, language: string = 'ru'): Promise<ICategory | null> {
    const sets: string[] = [];
    const values: any[] = [];

    // Обновляем только icon (nameKey нельзя менять, name обновляется через translations)
    if (data.icon !== undefined) {
      sets.push('icon = ?');
      values.push(data.icon);
    }

    // Обновляем перевод, если передан name
    if (data.name !== undefined) {
      await pool.execute(
        `INSERT INTO translations (id, entityType, entityId, language, name) 
         VALUES (UUID(), 'category', ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [id, language, data.name]
      );
    }

    if (sets.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE categories SET ${sets.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getCategoryWithSubcategories(id, language);
  }

  // Удалить категорию
  static async deleteCategory(id: string): Promise<void> {
    // Сначала удалить все подкатегории и их переводы
    const [subcategories] = await pool.execute(
      'SELECT id FROM subcategories WHERE categoryId = ?',
      [id]
    ) as any[];
    
    for (const sub of subcategories) {
      await pool.execute('DELETE FROM translations WHERE entityType = ? AND entityId = ?', ['subcategory', sub.id]);
    }
    
    await pool.execute('DELETE FROM subcategories WHERE categoryId = ?', [id]);
    
    // Удалить переводы категории
    await pool.execute('DELETE FROM translations WHERE entityType = ? AND entityId = ?', ['category', id]);
    
    // Затем удалить категорию
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  }

  // Удалить подкатегорию
  static async deleteSubcategory(id: string): Promise<void> {
    // Удалить переводы подкатегории
    await pool.execute('DELETE FROM translations WHERE entityType = ? AND entityId = ?', ['subcategory', id]);
    // Удалить подкатегорию
    await pool.execute('DELETE FROM subcategories WHERE id = ?', [id]);
  }

  // Проверить существование категории по ID
  static async categoryExists(categoryId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );
    return (rows as any[]).length > 0;
  }

  // Проверить существование подкатегории по ID
  static async subcategoryExists(subcategoryId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT id FROM subcategories WHERE id = ?',
      [subcategoryId]
    );
    return (rows as any[]).length > 0;
  }
}

export default CategoryModel;

