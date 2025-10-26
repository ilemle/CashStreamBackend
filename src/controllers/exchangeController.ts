import { Request, Response } from 'express';
import { fetchExchangeRates } from '../utils/currencies';

/**
 * Получить актуальные курсы валют
 */
export const getExchangeRatesController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rates = await fetchExchangeRates();
    res.status(200).json({
      success: true,
      data: rates,
      base: 'USD',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

