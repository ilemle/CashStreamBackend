import { Request, Response, NextFunction } from 'express';
import Budget, { IBudget } from '../models/Budget';

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
    // Преобразуем undefined в null для всех полей
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key, value ?? null])
    );

    const budgetData = { ...cleanBody, userId: req.user?.id || '' };
    const budget = await Budget.create(budgetData as IBudget);
    res.status(201).json({ success: true, data: budget });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
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
    
    // Преобразуем undefined в null для всех полей
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key, value ?? null])
    );

    const budget = await Budget.findByIdAndUpdate(req.params.id, cleanBody);
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
  }
};
