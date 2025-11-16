import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController';

const router = Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех зарегистрированных пользователей с пагинацией (требуются права администратора)
 *     tags: [Admin]
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
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество пользователей на странице
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по email или имени
 *         example: "user@example.com"
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
 *                   description: Общее количество пользователей
 *                 totalPages:
 *                   type: integer
 *                   description: Общее количество страниц
 *                 currentPage:
 *                   type: integer
 *                   description: Текущая страница
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "user@example.com"
 *                       name:
 *                         type: string
 *                         example: "Иван Петров"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       lastLogin:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T14:20:00.000Z"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Недостаточно прав (требуется роль администратора)
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/users', getAllUsers);

export default router;
