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
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

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
 *                 format: password
 *                 description: Пароль пользователя
 *                 example: "securepassword123"
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
 *       400:
 *         description: Неверные учетные данные
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Operation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 15
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/operations:
 *   post:
 *     summary: Создать операцию
 *     description: Создает новую финансовую операцию
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
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название операции
 *                 example: "Покупка продуктов"
 *               amount:
 *                 type: number
 *                 description: Сумма операции
 *                 example: 1500.50
 *               categoryId:
 *                 type: integer
 *                 description: ID категории
 *                 example: 1
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer]
 *                 description: Тип операции
 *                 example: "expense"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время операции
 *                 example: "2024-01-15T14:30:00.000Z"
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

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить все категории с подкатегориями
 *     description: Возвращает список всех категорий и их подкатегорий
 *     tags: [Categories]
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
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Category'
 *                       - type: object
 *                         properties:
 *                           subcategories:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Subcategory'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Создать пользовательскую категорию
 *     description: Создает новую пользовательскую категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название категории
 *                 example: "Моя категория"
 *               icon:
 *                 type: string
 *                 description: Иконка категории (опционально)
 *                 example: "category"
 *     responses:
 *       201:
 *         description: Категория создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Category'
 *                     - type: object
 *                       properties:
 *                         subcategories:
 *                           type: array
 *                           items:
 *                             type: object
 *                           example: []
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

/**
 * @swagger
 * /api/test/simple:
 *   get:
 *     summary: Простой тестовый роут без авторизации
 *     description: Самый простой роут для проверки работоспособности
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
 *                   example: "Simple test works!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /api/test:
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

/**
 * @swagger
 * /api/test/protected:
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
 *         $ref: '#/components/schemas/Error'
 */
