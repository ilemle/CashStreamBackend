import { Request, Response, NextFunction } from 'express';
import Budget from '../models/Budget';
import { CreateBudgetRequest } from '../types/database';

export const getBudgets = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const budgets = await Budget.find({ userId: req.user?.id || '' });
    res.status(200).json({ success: true, count: budgets.length, data: budgets });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBudget = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    console.log('📊 Create budget request body:', req.body);
    console.log('📊 CategoryId received:', req.body.categoryId, 'type:', typeof req.body.categoryId);
    console.log('📊 Creating budget - raw request body:', req.body);
    console.log('📊 User from token:', req.user);

    // Проверяем, существует ли пользователь
    const User = (await import('../models/User')).default;
    const existingUser = await User.findById(req.user?.id);
    console.log('📊 User exists in database:', !!existingUser);
    if (existingUser) {
      console.log('📊 User details:', { id: existingUser.id, username: existingUser.username, email: existingUser.email });
    } else {
      console.log('❌ User not found in database! This is the problem.');
    }

    // Проверяем, существует ли категория
    const pool = (await import('../config/database')).pool;
    try {
      const [categoryRows] = await pool.execute('SELECT id, name FROM categories WHERE id = ?', [req.body.categoryId]);
      console.log('📊 Category exists in database:', categoryRows.length > 0);
      if (categoryRows.length > 0) {
        console.log('📊 Category details:', categoryRows[0]);
      } else {
        console.log('❌ Category not found in database! Available categories:');
        const [allCategories] = await pool.execute('SELECT id, name FROM categories ORDER BY id');
        console.log('📊 All categories:', allCategories);
      }
    } catch (categoryError: any) {
      console.error('❌ Error checking category:', categoryError.message);
    }

    // Преобразуем undefined в null для SQL
    const rawData = req.body;
    const budgetData: CreateBudgetRequest & { userId: string } = {
      categoryId: rawData.categoryId || '',
      category: rawData.category || '',
      spent: rawData.spent ?? 0,
      budget: rawData.budget || 0,
      color: rawData.color || '',
      userId: req.user?.id || ''
    };

    console.log('📊 Processed budget data:', budgetData);

    // Валидация обязательных полей
    if (!budgetData.categoryId || !budgetData.category || !budgetData.budget || !budgetData.color) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: categoryId, category, budget, color'
      });
    }

    const budget = await Budget.create(budgetData);
    res.status(201).json({ success: true, data: budget });
    return;
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
};

export const updateBudget = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const existingBudget = await Budget.findById(req.params.id);
    if (!existingBudget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    if (existingBudget.userId !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    // Преобразуем undefined в null для SQL
    const updateData = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        value === undefined ? null : value
      ])
    );

    const budget = await Budget.findByIdAndUpdate(req.params.id, updateData);
    res.status(200).json({ success: true, data: budget });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBudget = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const existingBudget = await Budget.findById(req.params.id);
    if (!existingBudget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }
    
    if (existingBudget.userId !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
    return;
  }
};
