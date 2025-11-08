import { Request, Response, NextFunction } from 'express';
import { isValidCurrency } from '../utils/currencies';

// Расширяем Request для хранения валюты
declare module 'express-serve-static-core' {
  interface Request {
    secondaryCurrency?: string;
  }
}

/**
 * Middleware для чтения валюты из заголовка
 */
export const currencyConverter = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Читаем кастомный заголовок
    const secondaryCurrency = req.headers['x-secondary-currency'] as string;

    if (secondaryCurrency && isValidCurrency(secondaryCurrency)) {
      req.secondaryCurrency = secondaryCurrency.toUpperCase();
    }

    next();
  } catch (error) {
    // Если произошла ошибка в middleware, передаем её дальше
    console.error('Error in currencyConverter middleware:', error);
    next(error);
  }
};

