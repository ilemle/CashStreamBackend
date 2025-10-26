import { Request, Response } from 'express';
import Budget from '../models/Budget';

export const getBudgets = async (req: Request, res: Response) => {
  const budgets = await Budget.find({ user: req.user?.id });
  res.status(200).json({ success: true, count: budgets.length, data: budgets });
};

export const createBudget = async (req: Request, res: Response) => {
  const budget = await Budget.create({ ...req.body, user: req.user?.id });
  res.status(201).json({ success: true, data: budget });
};

export const updateBudget = async (req: Request, res: Response) => {
  const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: budget });
};

export const deleteBudget = async (req: Request, res: Response) => {
  await Budget.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
};

