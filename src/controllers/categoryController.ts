import { Request, Response, NextFunction } from 'express';
import CategoryModel from '../models/Category';

// Получить все категории (системные + пользовательские) с переводами
export const getCategories = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || null;
    const operationType = req.query.type as 'income' | 'expense' | undefined;
    const language = (req.query.language as string) || 'ru'; // По умолчанию русский

    // Получаем все категории с подкатегориями и переводами
    const allCategories = await CategoryModel.getAllCategoriesWithSubcategories(
      userId,
      language,
      operationType
    );

    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Создать пользовательскую категорию
export const createUserCategory = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, icon, color, type } = req.body;
    const language = (req.query.language as string) || (req.body.language as string) || 'ru';

    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    // Валидация типа категории
    if (type && type !== 'income' && type !== 'expense') {
      res.status(400).json({ message: 'Category type must be "income" or "expense"' });
      return;
    }

    // Валидация цвета (если указан)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({ message: 'Color must be a valid HEX color (e.g., #FF5733)' });
      return;
    }

    const category = await CategoryModel.createCategory(
      {
        nameKey: '', // Будет сгенерирован автоматически
        icon,
        color, // Если не указан, будет выбран автоматически
        type: type || 'expense', // По умолчанию категория для расходов
        isSystem: false,
        userId,
      },
      name,
      language
    );

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Добавить подкатегорию к категории
export const addSubcategory = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { name, icon } = req.body;
    const language = (req.query.language as string) || (req.body.language as string) || 'ru';

    if (!name) {
      res.status(400).json({ message: 'Subcategory name is required' });
      return;
    }

    const subcategory = await CategoryModel.createSubcategory(categoryId, name, language, icon);
    res.status(201).json(subcategory);
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ message: 'Error adding subcategory' });
  }
};

// Удалить пользовательскую категорию
export const deleteUserCategory = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.params;
    await CategoryModel.deleteCategory(categoryId);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Удалить подкатегорию
export const deleteSubcategory = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { subcategoryId } = req.params;
    await CategoryModel.deleteSubcategory(subcategoryId);
    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Error deleting subcategory' });
  }
};

