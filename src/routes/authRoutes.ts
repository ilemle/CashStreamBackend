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
 * /api/auth/register/send-code:
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
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Иван Петров"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email адрес для регистрации
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Пароль пользователя
 *                 example: "securepassword123"
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
 *                   example: "Verification code sent to your email"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "user@example.com"
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
 * /api/auth/register/verify:
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
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 description: Код подтверждения из email
 *                 example: "123456"
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Иван Петров"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Пароль пользователя
 *                 example: "securepassword123"
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
 * /api/auth/register/phone/send-code:
 *   post:
 *     summary: Отправить код верификации на телефон
 *     description: Отправляет код подтверждения на указанный номер телефона для регистрации
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Номер телефона в международном формате
 *                 example: "+79001234567"
 *     responses:
 *       200:
 *         description: Код отправлен
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post('/register/phone/send-code', sendPhoneVerificationCode);

/**
 * @swagger
 * /api/auth/register/phone/verify:
 *   post:
 *     summary: Подтвердить телефон и зарегистрироваться
 *     description: Проверяет код подтверждения и создает учетную запись пользователя
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *               - username
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Номер телефона в международном формате
 *                 example: "+79001234567"
 *               code:
 *                 type: string
 *                 description: Код подтверждения из SMS
 *                 example: "123456"
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Иван Петров"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Пароль пользователя
 *                 example: "securepassword123"
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post('/register/phone/verify', verifyPhoneAndRegister);

/**
 * @swagger
 * /api/auth/login:
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
 * /api/auth/me:
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

/**
 * @swagger
 * /api/auth/password/reset-request:
 *   post:
 *     summary: Запрос на сброс пароля
 *     description: Отправляет код подтверждения на email для сброса пароля
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
 *                 description: Email адрес пользователя
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Код отправлен
 *         $ref: '#/components/schemas/Error'
 *       400:
 *         description: Неверный email
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/auth/password/reset:
 *   post:
 *     summary: Сброс пароля
 *     description: Устанавливает новый пароль используя код подтверждения
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
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email адрес пользователя
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 description: Код подтверждения из email
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Новый пароль
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Пароль успешно изменен
 *         $ref: '#/components/schemas/Error'
 *       400:
 *         description: Неверный код или данные
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
// Восстановление пароля
router.post('/password/reset-request', requestPasswordReset);
router.post('/password/reset', resetPassword);

/**
 * @swagger
 * /api/auth/password/change:
 *   post:
 *     summary: Изменение пароля
 *     description: Изменяет пароль авторизованного пользователя
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Текущий пароль
 *                 example: "currentpassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Новый пароль
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Пароль успешно изменен
 *         $ref: '#/components/schemas/Error'
 *       400:
 *         description: Неверный текущий пароль
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
// Изменение пароля (требует авторизации)
router.post('/password/change', protect, changePassword);

/**
 * @swagger
 * /api/auth/account:
 *   delete:
 *     summary: Удаление аккаунта
 *     description: Полностью удаляет аккаунт авторизованного пользователя
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Аккаунт успешно удален
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
// Удаление аккаунта (требует авторизации)
router.delete('/account', protect, deleteAccount);

/**
 * @swagger
 * /api/auth/telegram/bot-url:
 *   get:
 *     summary: Получить URL Telegram бота
 *     description: Возвращает URL для авторизации через Telegram бота
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URL бота получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 botUrl:
 *                   type: string
 *                   example: "https://t.me/cashstream_bot"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/telegram/bot-url', getTelegramBotUrl);

/**
 * @swagger
 * /api/auth/telegram/login:
 *   post:
 *     summary: Авторизация через Telegram
 *     description: Авторизует пользователя через Telegram данные
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telegramData
 *             properties:
 *               telegramData:
 *                 type: object
 *                 description: Данные от Telegram авторизации
 *     responses:
 *       200:
 *         description: Авторизация успешна
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT токен
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные Telegram
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/telegram/login', loginWithTelegram);

/**
 * @swagger
 * /api/auth/telegram/check:
 *   post:
 *     summary: Проверка Telegram авторизации
 *     description: Проверяет статус авторизации через Telegram
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID сессии Telegram авторизации
 *                 example: "session_12345"
 *     responses:
 *       200:
 *         description: Статус авторизации получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные сессии
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/telegram/check', checkTelegramAuth);

export default router;

