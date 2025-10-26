// Коды валют по ISO 4217
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Record<string, Currency> = {
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
};

// База курсов (статические для демо)
// ⚠️ Для продакшена лучше использовать API:
// - exchangerate-api.com (бесплатно, 1500 запросов/месяц)
// - fixer.io (платно)
// - openexchangerates.org (бесплатный tier: 1000 запросов/месяц)
// - Центральный Банк РФ API для RUB
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.85,  // примерно 1.18 USD за EUR
  'GBP': 0.73,  // примерно 1.37 USD за GBP
  'JPY': 110.0, // примерно 110 JPY за USD
  'CNY': 6.45,  // примерно 6.45 CNY за USD
  'RUB': 75.0,  // примерно 75 RUB за USD
};

// Кэш для актуальных курсов (можно заменить на Redis в продакшене)
let cachedRates: Record<string, number> | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 3600000; // 1 час

/**
 * Получить актуальные курсы из exchangerate-api.com
 * Бесплатно: 1500 запросов/месяц
 */
export const fetchExchangeRates = async (): Promise<Record<string, number>> => {
  const now = Date.now();
  
  // Используем кэш если он актуален (1 час)
  if (cachedRates && (now - cacheExpiry) < CACHE_DURATION) {
    return cachedRates;
  }
  
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json() as { rates: Record<string, number> };
    
    if (data.rates) {
      cachedRates = data.rates;
      cacheExpiry = now;
      return data.rates;
    }
  } catch (error) {
    console.warn('⚠️  Failed to fetch exchange rates, using cached/static rates:', error);
  }
  
  // Fallback на кэш или статические курсы
  return cachedRates || EXCHANGE_RATES;
};

/**
 * Получить курсы с автоматическим кэшированием
 */
export const getExchangeRates = async (): Promise<Record<string, number>> => {
  return await fetchExchangeRates();
};

/**
 * Получить список валют
 */
export const getCurrencies = (): Currency[] => {
  return Object.values(CURRENCIES);
};

/**
 * Проверить существует ли валюта
 */
export const isValidCurrency = (code: string): boolean => {
  return code.toUpperCase() in CURRENCIES;
};

/**
 * Конвертировать сумму из одной валюты в другую
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  // Если валюты одинаковые
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Получаем актуальные курсы
  const rates = await fetchExchangeRates();
  
  const fromRate = rates[fromCurrency.toUpperCase()] || 1;
  const toRate = rates[toCurrency.toUpperCase()] || 1;

  // Конвертируем: amount * (toRate / fromRate)
  const converted = amount * (toRate / fromRate);
  
  return Math.round(converted * 100) / 100; // Округляем до 2 знаков
};

/**
 * Получить курс валюты
 */
export const getCurrencyRate = (currency: string): number => {
  return EXCHANGE_RATES[currency.toUpperCase()] || 1;
};

/**
 * Получить информацию о валюте
 */
export const getCurrencyInfo = (code: string): Currency | null => {
  return CURRENCIES[code.toUpperCase()] || null;
};

