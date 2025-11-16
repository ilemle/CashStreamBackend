import { Router } from 'express';
import { chatWithAI, streamChatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Чат с ИИ помощником
 *     description: Отправляет сообщение ИИ помощнику и получает ответ
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Сообщение пользователя
 *                 example: "Помоги мне проанализировать мои расходы за этот месяц"
 *               context:
 *                 type: object
 *                 description: Дополнительный контекст (опционально)
 *                 properties:
 *                   userData:
 *                     type: object
 *                     description: Данные пользователя
 *                   recentTransactions:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Недавние транзакции
 *     responses:
 *       200:
 *         description: Успешный ответ от ИИ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: Ответ ИИ помощника
 *                   example: "На основе ваших расходов за последний месяц я вижу, что основная часть уходит на..."
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Рекомендации от ИИ (опционально)
 *       400:
 *         description: Неверный запрос
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       429:
 *         description: Слишком много запросов
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера или ИИ
 *         $ref: '#/components/schemas/Error'
 */
router.post('/chat', protect, chatWithAI);

/**
 * @swagger
 * /ai/chat/stream:
 *   post:
 *     summary: Стриминг чат с ИИ помощником
 *     description: Отправляет сообщение ИИ помощнику и получает ответ в режиме стриминга (постепенная печать)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Сообщение пользователя
 *                 example: "Проанализируй мои бюджеты"
 *               context:
 *                 type: object
 *                 description: Дополнительный контекст (опционально)
 *     responses:
 *       200:
 *         description: Стриминг ответ от ИИ
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Поток текста от ИИ помощника
 *       400:
 *         description: Неверный запрос
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       429:
 *         description: Слишком много запросов
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера или ИИ
 *         $ref: '#/components/schemas/Error'
 */
router.post('/chat/stream', protect, streamChatWithAI);

export default router;

