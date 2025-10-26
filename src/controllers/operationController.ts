import { Request, Response, NextFunction } from 'express';
import Operation from '../models/Operation';

export const getOperations = async (req: Request, res: Response, _next: NextFunction) => {
  const ops = await Operation.find({ user: req.user?.id }).sort({ date: -1 });
  res.status(200).json({ success: true, count: ops.length, data: ops });
};

export const getOperation = async (req: Request, res: Response, _next: NextFunction) => {
  const op = await Operation.findById(req.params.id);
  if (!op || op.user.toString() !== req.user?.id) res.status(404).json({ success: false });
  else res.status(200).json({ success: true, data: op });
};

export const createOperation = async (req: Request, res: Response, _next: NextFunction) => {
  console.log(req);
  const op = await Operation.create({ ...req.body, user: req.user?.id });
  res.status(201).json({ success: true, data: op });
};

export const updateOperation = async (req: Request, res: Response, _next: NextFunction) => {
  const op = await Operation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: op });
};

export const deleteOperation = async (req: Request, res: Response, _next: NextFunction) => {
  await Operation.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
};

export const getBalance = async (req: Request, res: Response) => {
  const ops = await Operation.find({ user: req.user?.id });
  const balance = ops.reduce((sum, op) => sum + op.amount, 0);
  res.status(200).json({ success: true, data: { balance, totalOperations: ops.length } });
};

