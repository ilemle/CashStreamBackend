import { Router } from 'express';
import {
  getDebts,
  getDebt,
  createDebt,
  updateDebt,
  deleteDebt,
  getOverdueDebts,
  markDebtAsPaid
} from '../controllers/debtController';
import { protect } from '../middleware/auth';

const router = Router();

// Все роуты требуют авторизации
router.use(protect);

/**
 * @swagger
 * /debts:
 *   get:
 *     summary: Получить все долги пользователя
 *     description: Возвращает список всех долгов текущего авторизованного пользователя
 *     tags: [Debts]
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
 *                 count:
 *                   type: integer
 *                   description: Количество долгов
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Debt'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', getDebts);

/**
 * @swagger
 * /debts/overdue:
 *   get:
 *     summary: Получить просроченные долги
 *     description: Возвращает список всех просроченных долгов текущего пользователя
 *     tags: [Debts]
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
 *                 count:
 *                   type: integer
 *                   description: Количество просроченных долгов
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Debt'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/overdue', getOverdueDebts);

/**
 * @swagger
 * /debts/{id}:
 *   get:
 *     summary: Получить долг по ID
 *     description: Возвращает конкретный долг пользователя по его ID
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID долга
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
 *                   $ref: '#/components/schemas/Debt'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к долгу
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Долг не найден
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', getDebt);

/**
 * @swagger
 * /debts:
 *   post:
 *     summary: Создать долг
 *     description: Создает новый долг для пользователя
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - debtorName
 *               - amount
 *               - dueDate
 *               - type
 *             properties:
 *               debtorName:
 *                 type: string
 *                 description: Имя должника/заимодателя
 *                 example: "Иван Петров"
 *               amount:
 *                 type: number
 *                 description: Сумма долга
 *                 example: 50000.00
 *               currency:
 *                 type: string
 *                 description: Валюта долга
 *                 default: "RUB"
 *                 example: "RUB"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Дата возврата долга
 *                 example: "2024-12-31"
 *               type:
 *                 type: string
 *                 enum: [borrowed, lent]
 *                 description: Тип долга (взят в долг или одолжен)
 *                 example: "lent"
 *               description:
 *                 type: string
 *                 description: Описание долга
 *                 example: "Деньги на ремонт машины"
 *     responses:
 *       201:
 *         description: Долг создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Debt'
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
router.post('/', createDebt);

/**
 * @swagger
 * /debts/{id}:
 *   put:
 *     summary: Обновить долг
 *     description: Обновляет существующий долг пользователя
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID долга
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Debt'
 *     responses:
 *       200:
 *         description: Долг обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Debt'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к долгу
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Долг не найден
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateDebt);

/**
 * @swagger
 * /debts/{id}:
 *   delete:
 *     summary: Удалить долг
 *     description: Удаляет долг пользователя
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID долга
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Долг удален
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
 *                   example: "Debt deleted successfully"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к долгу
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Долг не найден
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteDebt);

/**
 * @swagger
 * /debts/{id}/paid:
 *   patch:
 *     summary: Отметить долг как оплаченный
 *     description: Помечает долг как полностью оплаченный
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID долга
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Долг отмечен как оплаченный
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Debt'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к долгу
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Долг не найден
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.patch('/:id/paid', markDebtAsPaid);

export default router;

