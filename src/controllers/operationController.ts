import { Request, Response, NextFunction } from 'express';
import Operation, { IOperation } from '../models/Operation';
import { addCurrencyConversion, addCurrencyConversionToArray } from '../utils/responseFormatter';

export const getOperations = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('📅 Backend received dates:', { startDate, endDate, userId: req.user?.id, tzOffset: new Date().getTimezoneOffset() });
    
    // Логируем несколько первых операций для отладки
    const debugOps = await Operation.find({ user: req.user?.id || '' });
    console.log('📋 Sample operations dates:', debugOps.slice(0, 3).map((op: IOperation) => ({ date: op.date, id: op.id })));
    
    // Строим базовый запрос
    const query: any = { user: req.user?.id || '' };
    
    // Добавляем фильтрацию по датам, если они переданы
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        // Парсим дату как UTC дату начала дня
        const start = new Date(startDate + 'T00:00:00.000Z');
        query.date.$gte = start;
        console.log('📅 Start date (UTC):', start);
      }
      
      if (endDate) {
        // Парсим дату как UTC дату конца дня
        const end = new Date(endDate + 'T23:59:59.999Z');
        query.date.$lte = end;
        console.log('📅 End date (UTC):', end);
      }
    }
    
    console.log('📋 MySQL query filter:', JSON.stringify(query, null, 2));
    const ops = await Operation.find(query);
    console.log('📋 Found operations:', ops.length);
    const opsWithConversion = await addCurrencyConversionToArray(ops, req);
    res.status(200).json({ success: true, count: ops.length, data: opsWithConversion });
  } catch (err: any) {
    console.error('❌ Error fetching operations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const op = await Operation.findById(req.params.id);
    if (!op || op.user !== req.user?.id) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    const opWithConversion = await addCurrencyConversion(op, req);
    res.status(200).json({ success: true, data: opWithConversion });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const opData: IOperation = {
      title: req.body.title,
      titleKey: req.body.titleKey,
      amount: req.body.amount,
      category: req.body.category,
      categoryKey: req.body.categoryKey,
      date: req.body.date || new Date(),
      timestamp: req.body.timestamp,
      type: req.body.type,
      fromAccount: req.body.fromAccount,
      toAccount: req.body.toAccount,
      currency: req.body.currency || 'RUB',  // Валюта операции
      user: req.user?.id || ''
    };
    const op = await Operation.create(opData);
    const opWithConversion = await addCurrencyConversion(op, req);
    res.status(201).json({ success: true, data: opWithConversion });
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
    if (existingOp.user !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    const op = await Operation.findByIdAndUpdate(req.params.id, req.body);
    const opWithConversion = await addCurrencyConversion(op || existingOp, req);
    res.status(200).json({ success: true, data: opWithConversion });
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
    
    if (existingOp.user !== req.user?.id) {
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
    const ops = await Operation.find({ user: req.user?.id || '' });
    const balance = ops.reduce((sum, op) => sum + Number(op.amount), 0);
    const balanceWithConversion = await addCurrencyConversion({ amount: balance } as IOperation, req);
    
    res.status(200).json({ 
      success: true, 
      data: { 
        balance, 
        convertedBalance: balanceWithConversion.convertedAmount,
        convertedCurrency: balanceWithConversion.convertedCurrency,
        convertedCurrencyCode: balanceWithConversion.convertedCurrencyCode,
        totalOperations: ops.length 
      } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
