import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Получить все бюджеты пользователя
 *     description: Возвращает список всех бюджетов текущего авторизованного пользователя
 *     tags: [Budgets]
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
 *                   description: Количество бюджетов
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/').get(getBudgets);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Создать бюджет
 *     description: Создает новый бюджет для указанной категории
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - category
 *               - budget
 *               - color
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 description: ID категории
 *                 example: 1
 *               category:
 *                 type: string
 *                 description: Название категории
 *                 example: "Еда и напитки"
 *               budget:
 *                 type: number
 *                 description: Сумма бюджета
 *                 example: 5000.00
 *               color:
 *                 type: string
 *                 description: Цвет бюджета
 *                 example: "#FF6B6B"
 *     responses:
 *       201:
 *         description: Бюджет создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
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
router.route('/').post(createBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Обновить бюджет
 *     description: Обновляет существующий бюджет
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID бюджета
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Budget'
 *     responses:
 *       200:
 *         description: Бюджет обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к бюджету
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Бюджет не найден
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').put(updateBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Удалить бюджет
 *     description: Удаляет бюджет пользователя
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID бюджета
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Бюджет удален
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
 *                   example: "Budget deleted successfully"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к бюджету
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Бюджет не найден
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').delete(deleteBudget);

export default router;

