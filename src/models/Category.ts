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
  color?: string; // HEX цвет категории (например, '#FF5733')
  type?: 'income' | 'expense'; // Тип категории: доход или расход
  subcategories?: ISubcategory[];
  isSystem: boolean; // Системная категория или пользовательская
  userId?: string; // Для пользовательских категорий
  createdAt?: Date;
}

class CategoryModel {
  // Палитры цветов для категорий (уникальные для каждого типа)
  private static readonly EXPENSE_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
    '#AA96DA', '#FCBAD3', '#FFD93D', '#6BCB77', '#4D96FF',
    '#FF9F43', '#10AC84', '#5F27CD', '#00D2D3', '#FF6348',
    '#FFA502', '#2ED573', '#3742FA', '#A4B0BE', '#FF6B9D'
  ];

  private static readonly INCOME_COLORS = [
    '#51CF66', '#339AF0', '#845EF7', '#FF922B', '#FCC419', '#868E96',
    '#20C997', '#FD7E14', '#E83E8C', '#6610F2', '#6F42C1', '#E74C3C',
    '#1ABC9C', '#3498DB', '#9B59B6', '#F39C12', '#E67E22', '#95A5A6'
  ];

  // Получить доступный цвет для категории (неиспользуемый в рамках типа)
  private static async getAvailableColor(type: 'income' | 'expense', userId?: string): Promise<string> {
    // Получаем все используемые цвета для категорий данного типа
    let query = 'SELECT DISTINCT color FROM categories WHERE type = ? AND color IS NOT NULL';
    const params: any[] = [type];
    
    if (userId) {
      query += ' AND userId = ?';
      params.push(userId);
    } else {
      query += ' AND isSystem = TRUE';
    }
    
    const [rows] = await pool.execute(query, params);
    const usedColors = new Set((rows as any[]).map((row: any) => row.color));
    
    // Выбираем палитру в зависимости от типа
    const palette = type === 'income' ? this.INCOME_COLORS : this.EXPENSE_COLORS;
    
    // Находим первый неиспользуемый цвет
    for (const color of palette) {
      if (!usedColors.has(color)) {
        return color;
      }
    }
    
    // Если все цвета использованы, возвращаем первый цвет из палитры
    return palette[0];
  }

  // Получить системные категории с переводами
  static async getSystemCategories(language: string = 'ru', operationType?: 'income' | 'expense'): Promise<ICategory[]> {
    let query = `SELECT 
        c.id,
        c.nameKey,
        c.icon,
        c.color,
        c.type,
        c.isSystem,
        c.userId,
        c.createdAt,
        COALESCE(t.name, c.nameKey) as name
      FROM categories c
      LEFT JOIN translations t ON t.entityType = 'category' 
        AND t.entityId = c.id 
        AND t.language = ?
      WHERE c.isSystem = TRUE`;
    
    const params: any[] = [language];
    
    // Фильтруем по типу операции, если указан
    if (operationType) {
      query += ' AND c.type = ?';
      params.push(operationType);
    }
    
    query += ' ORDER BY c.nameKey';
    
    const [rows] = await pool.execute(query, params);
    return rows as ICategory[];
  }

  // Получить пользовательские категории с переводами
  static async getUserCategories(userId: string, language: string = 'ru', operationType?: 'income' | 'expense'): Promise<ICategory[]> {
    let query = `SELECT 
        c.id,
        c.nameKey,
        c.icon,
        c.color,
        c.type,
        c.isSystem,
        c.userId,
        c.createdAt,
        COALESCE(t.name, c.nameKey) as name
      FROM categories c
      LEFT JOIN translations t ON t.entityType = 'category' 
        AND t.entityId = c.id 
        AND t.language = ?
      WHERE c.userId = ?`;
    
    const params: any[] = [language, userId];
    
    // Фильтруем по типу операции, если указан
    if (operationType) {
      query += ' AND c.type = ?';
      params.push(operationType);
    }
    
    query += ' ORDER BY c.nameKey';
    
    const [rows] = await pool.execute(query, params);
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
        c.color,
        c.type,
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
    // Получаем системные категории с фильтрацией по типу
    const systemCategories = await this.getSystemCategories(language, operationType);

    // Получаем пользовательские категории с фильтрацией по типу
    let userCategories: ICategory[] = [];
    if (userId) {
      userCategories = await this.getUserCategories(userId, language, operationType);
      // Добавляем подкатегории для пользовательских категорий
      for (let i = 0; i < userCategories.length; i++) {
        const categoryWithSubs = await this.getCategoryWithSubcategories(userCategories[i].id!, language);
        if (categoryWithSubs) {
          userCategories[i] = categoryWithSubs;
        }
      }
    }

    // Добавляем подкатегории для системных категорий
    for (let i = 0; i < systemCategories.length; i++) {
      const categoryWithSubs = await this.getCategoryWithSubcategories(systemCategories[i].id!, language);
      if (categoryWithSubs) {
        systemCategories[i] = categoryWithSubs;
      }
    }

    return [...systemCategories, ...userCategories];
  }

  // Создать пользовательскую категорию
  static async createCategory(data: Omit<ICategory, 'id' | 'name'>, name: string, language: string = 'ru'): Promise<ICategory> {
    const id = uuidv4();
    const nameKey = `category.user.${id}`; // Генерируем уникальный nameKey
    const type = data.type || 'expense'; // По умолчанию категория для расходов
    
    // Если цвет не указан, выбираем уникальный цвет автоматически
    let color = data.color;
    if (!color) {
      color = await this.getAvailableColor(type, data.userId);
    }
    
    await pool.execute(
      'INSERT INTO categories (id, nameKey, icon, color, type, isSystem, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nameKey, data.icon || null, color, type, false, data.userId]
    );

    // Создаем перевод для указанного языка
    await pool.execute(
      'INSERT INTO translations (id, entityType, entityId, language, name) VALUES (UUID(), ?, ?, ?, ?)',
      ['category', id, language, name]
    );

    return { ...data, id, nameKey, name, color };
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

    // Обновляем icon, color и type (nameKey нельзя менять, name обновляется через translations)
    if (data.icon !== undefined) {
      sets.push('icon = ?');
      values.push(data.icon);
    }
    
    if (data.color !== undefined) {
      sets.push('color = ?');
      values.push(data.color);
    }
    
    if (data.type !== undefined) {
      sets.push('type = ?');
      values.push(data.type);
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

