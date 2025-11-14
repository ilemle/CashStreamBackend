import { Request, Response, NextFunction } from 'express';
import Debt, { IDebt } from '../models/Debt';
import Operation, { IOperation } from '../models/Operation';
import { addCurrencyConversion, addCurrencyConversionToArray } from '../utils/responseFormatter';

/**
 * Создает операцию при создании долга
 */
const createOperationFromDebt = (debt: IDebt, userId: string): IOperation => {
  const { title, amount, currency, type, person } = debt;
  
  if (type === 'lent') {
    // Дал в долг - операция расхода
    // Название: название долга + кому одолжил
    return {
      title: `${title} - ${person}`,
      amount: -Math.abs(amount), // Отрицательная сумма для расхода
      categoryId: null, // Категория для долгов не привязана к конкретной категории
      type: 'expense',
      currency: currency || 'RUB',
      date: new Date(),
      userId: userId,
    };
  } else {
    // Взял в долг - операция дохода
    // Название: название долга + у кого взял
    return {
      title: `${title} - ${person}`,
      amount: Math.abs(amount), // Положительная сумма для дохода
      categoryId: null, // Категория для долгов не привязана к конкретной категории
      type: 'income',
      currency: currency || 'RUB',
      date: new Date(),
      userId: userId,
    };
  }
};

/**
 * Создает операцию при возврате долга
 */
const createOperationFromDebtReturn = (debt: IDebt, userId: string): IOperation => {
  const { title, amount, currency, type } = debt;
  
  if (type === 'lent') {
    // Возвращают мне (я дал в долг) - операция дохода
    // Название: "Возврат долга" + название долга
    return {
      title: `Возврат долга: ${title}`,
      amount: Math.abs(amount), // Положительная сумма для дохода
      categoryId: null, // Категория для долгов не привязана к конкретной категории
      type: 'income',
      currency: currency || 'RUB',
      date: new Date(),
      userId: userId,
    };
  } else {
    // Я возвращаю (я взял в долг) - операция расхода
    // Название: "Возврат долга" + название долга
    return {
      title: `Возврат долга: ${title}`,
      amount: -Math.abs(amount), // Отрицательная сумма для расхода
      categoryId: null, // Категория для долгов не привязана к конкретной категории
      type: 'expense',
      currency: currency || 'RUB',
      date: new Date(),
      userId: userId,
    };
  }
};

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
    
    // Автоматически создаем операцию при создании долга
    try {
      const operation = createOperationFromDebt(debt, userId);
      await Operation.create(operation);
      console.log('✅ Operation created from debt:', operation);
    } catch (error: any) {
      console.error('❌ Error creating operation from debt:', error);
      // Не блокируем создание долга, если операция не создалась
    }
    
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

    // Сохраняем оригинальный долг для создания операции
    const originalDebt = debt;
    
    const updatedDebt = await Debt.findByIdAndUpdate(id, {
      isPaid: true,
      paidDate: new Date()
    });

    // Автоматически создаем операцию при возврате долга
    try {
      const operation = createOperationFromDebtReturn(originalDebt, userId);
      await Operation.create(operation);
      console.log('✅ Operation created from debt return:', operation);
    } catch (error: any) {
      console.error('❌ Error creating operation from debt return:', error);
      // Не блокируем возврат долга, если операция не создалась
    }

    const debtWithConversion = await addCurrencyConversion(updatedDebt!, req);

    return res.json({
      success: true,
      data: debtWithConversion
    });
  } catch (error: any) {
    return next(error);
  }
};

