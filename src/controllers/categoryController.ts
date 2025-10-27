import { Request, Response, NextFunction } from 'express';
import CategoryModel from '../models/Category';
import { CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'; // Мы создадим этот файл

// Получить все категории (системные + пользовательские)
export const getCategories = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const operationType = req.query.type as string;

    // Получаем системные категории
    const systemCategories = operationType === 'income' ? INCOME_CATEGORIES : CATEGORIES;

    // Получаем пользовательские категории
    let userCategories: any[] = [];
    if (userId) {
      userCategories = await CategoryModel.getUserCategories(userId);
      // Преобразуем пользовательские категории в нужный формат и добавляем подкатегории
      for (let i = 0; i < userCategories.length; i++) {
        const categoryWithSubs = await CategoryModel.getCategoryWithSubcategories(userCategories[i].id);
        if (categoryWithSubs) {
          userCategories[i] = categoryWithSubs;
        }
      }
    }

    // Объединяем системные и пользовательские категории
    const allCategories = [...systemCategories, ...userCategories];

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
    const { name, icon } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const category = await CategoryModel.createCategory({
      name,
      icon,
      isSystem: false,
      userId,
    });

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

    if (!name) {
      res.status(400).json({ message: 'Subcategory name is required' });
      return;
    }

    const subcategory = await CategoryModel.createSubcategory(categoryId, name, icon);
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

