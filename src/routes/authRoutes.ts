import { Router } from 'express';
import {
  sendVerificationCode,
  verifyEmailAndRegister,
  sendPhoneVerificationCode,
  verifyPhoneAndRegister,
  login,
  getMe,
  requestPasswordReset,
  resetPassword,
  changePassword,
  deleteAccount,
  getTelegramBotUrl,
  loginWithTelegram,
  checkTelegramAuth
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /auth/register/send-code:
 *   post:
 *     summary: Отправить код верификации на email
 *     description: Отправляет код подтверждения на указанный email адрес для регистрации
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email адрес для регистрации
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Код отправлен
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
 *                   example: "Verification code sent"
 *       400:
 *         description: Ошибка валидации
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/register/send-code', sendVerificationCode);

/**
 * @swagger
 * /auth/register/verify:
 *   post:
 *     summary: Подтвердить email и зарегистрироваться
 *     description: Проверяет код подтверждения и создает учетную запись пользователя
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 description: Код подтверждения из email
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Пароль пользователя
 *                 example: "securepassword"
 *               firstName:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Иван"
 *               lastName:
 *                 type: string
 *                 description: Фамилия пользователя
 *                 example: "Иванов"
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
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
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT токен для аутентификации
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации или неверный код
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/register/verify', verifyEmailAndRegister);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Войти в систему
 *     description: Авторизация пользователя по email или номеру телефона
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email или номер телефона
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Успешный вход
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT токен для аутентификации
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Неверные учетные данные
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     description: Возвращает данные текущего авторизованного пользователя
 *     tags: [Authentication]
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/me', protect, getMe);

// Восстановление пароля
router.post('/password/reset-request', requestPasswordReset);
router.post('/password/reset', resetPassword);

// Изменение пароля (требует авторизации)
router.post('/password/change', protect, changePassword);

// Удаление аккаунта (требует авторизации)
router.delete('/account', protect, deleteAccount);

// Получение информации о текущем пользователе
router.get('/me', protect, getMe);

// Telegram авторизация
router.get('/telegram/bot-url', getTelegramBotUrl);
router.post('/telegram/login', loginWithTelegram);
router.post('/telegram/check', checkTelegramAuth);

export default router;

