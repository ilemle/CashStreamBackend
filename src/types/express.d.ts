/// <reference types="express" />

/**
 * Расширение типов Express
 * Добавляет кастомные поля в Request объект
 */
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Текущий авторизованный пользователь
     * Устанавливается middleware auth.ts после проверки JWT токена
     */
    user?: { 
      id: string;
      // Можно расширить при необходимости
      // username?: string;
      // email?: string;
    };
    
    /**
     * Вторичная валюта для конвертации
     * Устанавливается middleware currency.ts
     */
    secondaryCurrency?: string;
  }
}

export {};

