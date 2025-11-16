import { Router } from 'express';
import { getOperations, getOperation, createOperation, updateOperation, deleteOperation, getBalance, createOperationsBatch } from '../controllers/operationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/operations:
 *   get:
 *     summary: Получить операции с пагинацией
 *     description: Возвращает список операций пользователя с поддержкой пагинации, фильтрации по дате и другим параметрам
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество операций на странице
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата фильтрации (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата фильтрации (YYYY-MM-DD)
 *       - in: query
 *         name: timezoneOffset
 *         schema:
 *           type: integer
 *         description: Смещение часового пояса в минутах
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
 *                 count:
 *                   type: integer
 *                   description: Количество операций на текущей странице
 *                 total:
 *                   type: integer
 *                   description: Общее количество операций
 *                 page:
 *                   type: integer
 *                   description: Текущая страница
 *                 limit:
 *                   type: integer
 *                   description: Лимит на страницу
 *                 totalPages:
 *                   type: integer
 *                   description: Общее количество страниц
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Есть ли следующая страница
 *                 hasPrevPage:
 *                   type: boolean
 *                   description: Есть ли предыдущая страница
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Operation'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/').get(getOperations);

/**
 * @swagger
 * /api/operations:
 *   post:
 *     summary: Создать операцию
 *     description: Создает новую финансовую операцию (доход, расход или перевод)
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название операции
 *                 example: "Покупка продуктов"
 *               amount:
 *                 type: number
 *                 description: Сумма операции
 *                 example: -500.50
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer]
 *                 description: Тип операции
 *                 example: "expense"
 *               category:
 *                 type: string
 *                 description: Название категории
 *                 example: "Еда и напитки"
 *               categoryId:
 *                 type: integer
 *                 description: ID категории
 *                 example: 1
 *               subcategoryId:
 *                 type: string
 *                 description: ID подкатегории
 *                 example: "uuid-string"
 *               currency:
 *                 type: string
 *                 description: Валюта операции
 *                 example: "RUB"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата операции
 *                 example: "2024-01-15T10:30:00.000Z"
 *               fromAccount:
 *                 type: string
 *                 description: Счет отправителя (для переводов)
 *                 example: "Основной счет"
 *               toAccount:
 *                 type: string
 *                 description: Счет получателя (для переводов)
 *                 example: "Сберегательный счет"
 *     responses:
 *       201:
 *         description: Операция создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Operation'
 *       400:
 *         description: Ошибка валидации
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/').post(createOperation);

/**
 * @swagger
 * /api/operations/batch:
 *   post:
 *     summary: Создать несколько операций
 *     description: Создает несколько финансовых операций одновременно
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operations
 *             properties:
 *               operations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Operation'
 *                 description: Массив операций для создания
 *     responses:
 *       201:
 *         description: Операции созданы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Operation'
 *       400:
 *         description: Ошибка валидации
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/batch').post(createOperationsBatch);

/**
 * @swagger
 * /api/operations/balance:
 *   get:
 *     summary: Получить баланс
 *     description: Возвращает текущий баланс пользователя с учетом всех операций
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       description: Текущий баланс
 *                       example: 15450.75
 *                     totalOperations:
 *                       type: integer
 *                       description: Общее количество операций
 *                       example: 125
 *                     convertedBalance:
 *                       type: number
 *                       description: Баланс в дополнительной валюте
 *                       example: 215.50
 *                     convertedCurrency:
 *                       type: string
 *                       description: Код дополнительной валюты
 *                       example: "USD"
 *                     convertedCurrencyCode:
 *                       type: string
 *                       description: Код дополнительной валюты
 *                       example: "USD"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/balance').get(getBalance);

/**
 * @swagger
 * /api/operations/{id}:
 *   get:
 *     summary: Получить операцию по ID
 *     description: Возвращает детальную информацию об операции
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID операции
 *         example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                 data:
 *                   $ref: '#/components/schemas/Operation'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к операции
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Операция не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').get(getOperation);

/**
 * @swagger
 * /api/operations/{id}:
 *   put:
 *     summary: Обновить операцию
 *     description: Обновляет существующую операцию
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID операции
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Operation'
 *     responses:
 *       200:
 *         description: Операция обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Operation'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к операции
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Операция не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').put(updateOperation);

/**
 * @swagger
 * /api/operations/{id}:
 *   delete:
 *     summary: Удалить операцию
 *     description: Удаляет операцию пользователя
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID операции
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Операция удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation deleted successfully"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к операции
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Операция не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').delete(deleteOperation);

export default router;

