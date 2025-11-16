import { Router } from 'express';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Получить все цели пользователя
 *     description: Возвращает список всех финансовых целей текущего авторизованного пользователя
 *     tags: [Goals]
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
 *                   description: Количество целей
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/').get(getGoals);

/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Создать цель
 *     description: Создает новую финансовую цель
 *     tags: [Goals]
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
 *               - target
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название цели
 *                 example: "Отпуск на Бали"
 *               target:
 *                 type: number
 *                 description: Целевая сумма
 *                 example: 150000.00
 *               current:
 *                 type: number
 *                 description: Текущая сумма (опционально)
 *                 example: 25000.00
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: Дата дедлайна
 *                 example: "2024-12-31"
 *               autoFill:
 *                 type: boolean
 *                 description: Автоматическое пополнение
 *                 example: true
 *               autoFillPercentage:
 *                 type: number
 *                 description: Процент от доходов для автопополнения
 *                 example: 20
 *     responses:
 *       201:
 *         description: Цель создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
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
router.route('/').post(createGoal);

/**
 * @swagger
 * /goals/{id}:
 *   put:
 *     summary: Обновить цель
 *     description: Обновляет существующую финансовую цель
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID цели
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       200:
 *         description: Цель обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к цели
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Цель не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').put(updateGoal);

/**
 * @swagger
 * /goals/{id}:
 *   delete:
 *     summary: Удалить цель
 *     description: Удаляет финансовую цель пользователя
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID цели
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Цель удалена
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
 *                   example: "Goal deleted successfully"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет доступа к цели
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Цель не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.route('/:id').delete(deleteGoal);

export default router;

