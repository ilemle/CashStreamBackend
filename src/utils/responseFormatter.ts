import { getCurrencyInfo } from './currencies';
import { Request } from 'express';

/**
 * Добавить конвертированное значение к сумме
 */
export const addCurrencyConversion = async <T extends { amount: number | string }>(
  data: T,
  req: Request
): Promise<T & { convertedAmount?: number; convertedCurrency?: string; convertedCurrencyCode?: string }> => {
  const secondaryCurrency = req.secondaryCurrency;

  if (!secondaryCurrency) {
    return data;
  }

  const originalAmount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount.toString());
  
  // Используем валюту операции (или RUB по умолчанию)
  const originalCurrency = (data as any).currency || 'RUB';
  
  const { convertCurrency } = await import('./currencies');
  const convertedAmount = await convertCurrency(originalAmount, originalCurrency, secondaryCurrency);
  const currencyInfo = getCurrencyInfo(secondaryCurrency);

  return {
    ...data,
    convertedAmount,
    convertedCurrency: currencyInfo?.symbol || secondaryCurrency,
    convertedCurrencyCode: secondaryCurrency,
  };
};

/**
 * Обработать массив данных с конвертацией
 */
export const addCurrencyConversionToArray = async <T extends { amount: number | string }>(
  dataArray: T[],
  req: Request
): Promise<(T & { convertedAmount?: number; convertedCurrency?: string; convertedCurrencyCode?: string })[]> => {
  return Promise.all(dataArray.map(item => addCurrencyConversion(item, req)));
};

