import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Тестовый эндпоинт
 *     description: Простой тестовый эндпоинт для проверки Swagger
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Swagger работает!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    message: 'Swagger работает!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /test/protected:
 *   get:
 *     summary: Защищенный тестовый эндпоинт
 *     description: Тестовый эндпоинт с JWT авторизацией
 *     tags: [Test]
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
 *                 message:
 *                   type: string
 *                   example: "Защищенный роут работает!"
 *                 userId:
 *                   type: string
 *                   format: uuid
 *       401:
 *         description: Не авторизован
 */
router.get('/protected', protect, (req: express.Request, res: express.Response) => {
  res.json({
    message: 'Защищенный роут работает!',
    userId: req.user?.id
  });
});

export default router;
