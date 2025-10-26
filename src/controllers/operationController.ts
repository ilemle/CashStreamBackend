import { Request, Response, NextFunction } from 'express';
import Operation, { IOperation } from '../models/Operation';

export const getOperations = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const ops = await Operation.find({ user: Number(req.user?.id) });
    res.status(200).json({ success: true, count: ops.length, data: ops });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const op = await Operation.findById(req.params.id);
    if (!op || op.user !== Number(req.user?.id)) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    res.status(200).json({ success: true, data: op });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const opData = { ...req.body, user: Number(req.user?.id) };
    const op = await Operation.create(opData as IOperation);
    res.status(201).json({ success: true, data: op });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Проверяем существование и владельца
    const existingOp = await Operation.findById(req.params.id);
    if (!existingOp) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    
    // Проверяем, что операция принадлежит текущему пользователю
    if (existingOp.user !== Number(req.user?.id)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    const op = await Operation.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ success: true, data: op });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Проверяем существование и владельца
    const existingOp = await Operation.findById(req.params.id);
    if (!existingOp) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    
    if (existingOp.user !== Number(req.user?.id)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    await Operation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const ops = await Operation.find({ user: Number(req.user?.id) });
    const balance = ops.reduce((sum, op) => sum + Number(op.amount), 0);
    res.status(200).json({ success: true, data: { balance, totalOperations: ops.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
