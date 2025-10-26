import { Request, Response } from 'express';
import { getCurrencies } from '../utils/currencies';

/**
 * Получить список доступных валют
 */
export const getCurrenciesList = (_req: Request, res: Response): void => {
  try {
    const currencies = getCurrencies();
    res.status(200).json({
      success: true,
      data: currencies
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

