import { Request, Response, NextFunction } from 'express';
import Goal, { IGoal } from '../models/Goal';

export const getGoals = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const goals = await Goal.find({ user: req.user?.id || '' });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createGoal = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const goalData = { ...req.body, user: req.user?.id || '' };
    const goal = await Goal.create(goalData as IGoal);
    res.status(201).json({ success: true, data: goal });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateGoal = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const existingGoal = await Goal.findById(req.params.id);
    if (!existingGoal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }
    
    if (existingGoal.user !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteGoal = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const existingGoal = await Goal.findById(req.params.id);
    if (!existingGoal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }
    
    if (existingGoal.user !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    await Goal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
