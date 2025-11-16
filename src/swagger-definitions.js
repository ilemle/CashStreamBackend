/**
 * @swagger
 * /auth/register/send-code:
 *   post:
 *     summary: Отправить код верификации на email
 *     description: Отправляет код верификации на указанный email адрес для регистрации
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
 *         description: Код отправлен успешно
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
 *       400:
 *         description: Неверный email
 *         $ref: '#/components/schemas/Error'
 *       429:
 *         description: Слишком много запросов
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/register/verify:
 *   post:
 *     summary: Подтвердить email и зарегистрироваться
 *     description: Подтверждает email кодом и создает новый аккаунт
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
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 description: Код верификации из email
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "securepassword123"
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Иван Петров"
 *     responses:
 *       201:
 *         description: Аккаунт создан успешно
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
 *                   example: "Account created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные или код
 *         $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email уже зарегистрирован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Войти в систему
 *     description: Аутентифицирует пользователя и возвращает JWT токен
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
 *                 description: Email или телефон для входа
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Пароль пользователя
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: Вход выполнен успешно
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
 *                       description: JWT токен для авторизации
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные учетные данные
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неверный пароль
 *         $ref: '#/components/schemas/Error'
 *       429:
 *         description: Слишком много попыток входа
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     description: Возвращает информацию о авторизованном пользователе
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
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
 * /operations:
 *   get:
 *     summary: Получить операции с пагинацией
 *     description: Возвращает список финансовых операций пользователя с пагинацией
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
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество операций на странице
 *         example: 10
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата фильтрации (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата фильтрации (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense, transfer]
 *         description: Тип операции
 *         example: "expense"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: ID категории для фильтрации
 *         example: 1
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
 * /operations:
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
 *               subcategoryId:
 *                 type: integer
 *                 description: ID подкатегории
 *                 example: 5
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer]
 *                 description: Тип операции
 *                 example: "expense"
 *               currency:
 *                 type: string
 *                 description: Валюта операции
 *                 default: "RUB"
 *                 example: "RUB"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время операции
 *                 example: "2024-01-15T14:30:00.000Z"
 *               fromAccount:
 *                 type: string
 *                 description: Счет отправителя (для переводов)
 *                 example: "card"
 *               toAccount:
 *                 type: string
 *                 description: Счет получателя (для переводов)
 *                 example: "cash"
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
 * /operations/balance:
 *   get:
 *     summary: Получить баланс
 *     description: Возвращает текущий баланс пользователя по всем счетам
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
 *                     totalIncome:
 *                       type: number
 *                       example: 150000.00
 *                     totalExpense:
 *                       type: number
 *                       example: 125000.00
 *                     balance:
 *                       type: number
 *                       example: 25000.00
 *                     currency:
 *                       type: string
 *                       example: "RUB"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /budgets:
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
 * /budgets:
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
 * /categories:
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
 * /categories:
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
 *                 description: Иконка категории
 *                 example: "star"
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
 *       409:
 *         description: Категория с таким именем уже существует
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Тестовый эндпоинт
 *     description: Простой тестовый эндпоинт для проверки работы API
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
 *         $ref: '#/components/schemas/Error'
 */
