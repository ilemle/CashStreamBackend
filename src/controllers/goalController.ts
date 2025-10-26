import { Request, Response } from 'express';
import Goal from '../models/Goal';

export const getGoals = async (req: Request, res: Response) => {
  const goals = await Goal.find({ user: req.user?.id });
  res.status(200).json({ success: true, count: goals.length, data: goals });
};

export const createGoal = async (req: Request, res: Response) => {
  const goal = await Goal.create({ ...req.body, user: req.user?.id });
  res.status(201).json({ success: true, data: goal });
};

export const updateGoal = async (req: Request, res: Response) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: goal });
};

export const deleteGoal = async (req: Request, res: Response) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
};

