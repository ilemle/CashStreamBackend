import { Request, Response, NextFunction } from 'express';
import Debt, { IDebt } from '../models/Debt';
import { addCurrencyConversion, addCurrencyConversionToArray } from '../utils/responseFormatter';

// Получить все долги пользователя
export const getDebts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { isPaid } = req.query;

    const filter: any = { userId: userId };
    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true';
    }

    const debts = await Debt.find(filter);
    const debtsWithConversion = await addCurrencyConversionToArray(debts, req);
    
    return res.json({
      success: true,
      data: debtsWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

// Получить один долг
export const getDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const debt = await Debt.findById(id);
    
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    if (debt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const debtWithConversion = await addCurrencyConversion(debt, req);
    
    return res.json({
      success: true,
      data: debtWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

// Создать долг
export const createDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { title, amount, currency, type, person, dueDate } = req.body;

    if (!title || !amount || !type || !person || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, amount, type, person, dueDate'
      });
    }

    if (type !== 'lent' && type !== 'borrowed') {
      return res.status(400).json({
        success: false,
        message: 'Type must be "lent" or "borrowed"'
      });
    }

    const debtData: IDebt = {
      title,
      amount: Number(amount),
      currency: currency || 'RUB',
      type,
      person,
      dueDate: new Date(dueDate),
      isPaid: false,
      userId: userId
    };

    const debt = await Debt.create(debtData);
    const debtWithConversion = await addCurrencyConversion(debt, req);

    return res.status(201).json({
      success: true,
      data: debtWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

// Обновить долг
export const updateDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    const debt = await Debt.findById(id);
    
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    if (debt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Преобразуем даты если они есть
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.paidDate) {
      updateData.paidDate = new Date(updateData.paidDate);
    }

    const updatedDebt = await Debt.findByIdAndUpdate(id, updateData);
    const debtWithConversion = await addCurrencyConversion(updatedDebt!, req);

    return res.json({
      success: true,
      data: debtWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

// Удалить долг
export const deleteDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const debt = await Debt.findById(id);
    
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    if (debt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Debt.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Debt deleted successfully'
    });
  } catch (error: any) {
    return next(error);
  }
};

// Получить просроченные долги
export const getOverdueDebts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const overdueDebts = await Debt.findOverdue(userId);
    const debtsWithConversion = await addCurrencyConversionToArray(overdueDebts, req);

    return res.json({
      success: true,
      data: debtsWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

// Отметить долг как оплаченный
export const markDebtAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const debt = await Debt.findById(id);
    
    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found'
      });
    }

    if (debt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedDebt = await Debt.findByIdAndUpdate(id, {
      isPaid: true,
      paidDate: new Date()
    });

    const debtWithConversion = await addCurrencyConversion(updatedDebt!, req);

    return res.json({
      success: true,
      data: debtWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

