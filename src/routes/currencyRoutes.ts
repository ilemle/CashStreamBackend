import { Router } from 'express';
import { getCurrenciesList } from '../controllers/currencyController';
import { getExchangeRatesController } from '../controllers/exchangeController';

const router = Router();

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     summary: Получить список валют
 *     description: Возвращает список поддерживаемых валют
 *     tags: [Currencies]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 currencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: "USD"
 *                       name:
 *                         type: string
 *                         example: "US Dollar"
 *                       symbol:
 *                         type: string
 *                         example: "$"
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', getCurrenciesList);

/**
 * @swagger
 * /api/currencies/rates:
 *   get:
 *     summary: Получить курсы валют
 *     description: Возвращает текущие курсы обмена валют
 *     tags: [Currencies]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           default: "RUB"
 *         description: Базовая валюта
 *         example: "RUB"
 *       - in: query
 *         name: symbols
 *         schema:
 *           type: string
 *         description: Список валют через запятую
 *         example: "USD,EUR,GBP"
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rates:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                   example: {"USD": 0.0102, "EUR": 0.0089}
 *                 base:
 *                   type: string
 *                   example: "RUB"
 *                 timestamp:
 *                   type: integer
 *                   example: 1640995200
 *       400:
 *         description: Неверные параметры запроса
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/rates', getExchangeRatesController);

export default router;

