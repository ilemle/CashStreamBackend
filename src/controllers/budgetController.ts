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
