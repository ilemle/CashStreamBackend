import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { CategoryTable, SubcategoryTable } from '../types/database';

// Получить все категории с подкатегориями
export const getCategories = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    console.log('📂 Getting categories for user:', req.user?.id);

    // Получаем все системные категории и пользовательские категории
    const [categoriesResult] = await pool.execute(
      'SELECT id, name, icon, isSystem, userId, createdAt FROM categories WHERE isSystem = TRUE OR userId = ? ORDER BY id',
      [req.user?.id]
    );

    // Получаем все подкатегории
    const [subcategoriesResult] = await pool.execute(
      'SELECT s.id, s.categoryId, s.name, s.icon, s.createdAt FROM subcategories s JOIN categories c ON s.categoryId = c.id WHERE c.isSystem = TRUE OR c.userId = ? ORDER BY s.categoryId, s.id',
      [req.user?.id]
    );

    const categories = categoriesResult as CategoryTable[];
    const subcategories = subcategoriesResult as SubcategoryTable[];

    // Группируем подкатегории по категориям
    const categoriesWithSubcategories = categories.map(category => ({
      ...category,
      subcategories: subcategories.filter(sub => sub.categoryId === category.id)
    }));

    console.log(`📂 Found ${categories.length} categories with ${subcategories.length} subcategories`);

    res.json({
      success: true,
      data: categoriesWithSubcategories
    });
    return;

  } catch (error: any) {
    console.error('❌ Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
    return;
  }
};

// Создать пользовательскую категорию
export const createCategory = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
      return;
    }

    // Проверяем, не существует ли уже категория с таким именем
    const [existingResult] = await pool.execute(
      'SELECT id FROM categories WHERE name = ? AND (userId = ? OR isSystem = TRUE)',
      [name, req.user?.id]
    );

    if ((existingResult as any[]).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
      return;
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (name, icon, userId) VALUES (?, ?, ?)',
      [name, icon || null, req.user?.id]
    );

    const categoryId = (result as any).insertId;

    res.status(201).json({
      success: true,
      data: {
        id: categoryId,
        name,
        icon: icon || null,
        isSystem: false,
        userId: req.user?.id,
        subcategories: []
      }
    });
    return;

  } catch (error: any) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
    return;
  }
};

// Создать подкатегорию
export const createSubcategory = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { categoryId, name, icon } = req.body;

    if (!categoryId || !name) {
      res.status(400).json({
        success: false,
        message: 'CategoryId and name are required'
      });
      return;
    }

    // Проверяем, что категория существует и доступна пользователю
    const [categoryResult] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND (isSystem = TRUE OR userId = ?)',
      [categoryId, req.user?.id]
    );

    if ((categoryResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // Проверяем, не существует ли уже подкатегория с таким именем в этой категории
    const [existingResult] = await pool.execute(
      'SELECT id FROM subcategories WHERE categoryId = ? AND name = ?',
      [categoryId, name]
    );

    if ((existingResult as any[]).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      });
      return;
    }

    const [result] = await pool.execute(
      'INSERT INTO subcategories (categoryId, name, icon) VALUES (?, ?, ?)',
      [categoryId, name, icon || null]
    );

    const subcategoryId = (result as any).insertId;

    res.status(201).json({
      success: true,
      data: {
        id: subcategoryId,
        categoryId: Number(categoryId),
        name,
        icon: icon || null
      }
    });
    return;

  } catch (error: any) {
    console.error('❌ Error creating subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory'
    });
    return;
  }
};

