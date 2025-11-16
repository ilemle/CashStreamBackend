import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CashStream API',
      version: '1.0.0',
      description: 'API для управления финансами CashStream',
      contact: {
        name: 'CashStream Support',
        email: 'support@cashstream.com'
      }
    },
    tags: [
      { name: 'Health', description: 'Проверка здоровья сервера' },
      { name: 'Test', description: 'Тестовые эндпоинты' },
      { name: 'Authentication', description: 'Аутентификация пользователей' },
      { name: 'Categories', description: 'Управление категориями' },
      { name: 'Operations', description: 'Финансовые операции' },
      { name: 'Budgets', description: 'Бюджеты по категориям' },
      { name: 'Goals', description: 'Финансовые цели' },
      { name: 'Currencies', description: 'Курсы валют' },
      { name: 'AI', description: 'ИИ помощник' },
      { name: 'Debts', description: 'Управление долгами' },
      { name: 'Admin', description: 'Администрирование' }
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.cashstream.com',
        description: 'Production server',
      },
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Current server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            isVerified: { type: 'boolean' },
            telegramId: { type: 'string' },
            primaryCurrency: { type: 'string' },
            secondaryCurrency: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            icon: { type: 'string', nullable: true },
            isSystem: { type: 'boolean' },
            userId: { type: 'string', nullable: true, format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            subcategories: {
              type: 'array',
              items: { $ref: '#/components/schemas/Subcategory' }
            }
          }
        },
        Subcategory: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            categoryId: { type: 'integer' },
            name: { type: 'string' },
            icon: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Operation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            amount: { type: 'number' },
            category: { type: 'string' },
            categoryId: { type: 'integer', nullable: true },
            subcategoryId: { type: 'string', nullable: true },
            type: {
              type: 'string',
              enum: ['income', 'expense', 'transfer']
            },
            currency: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            fromAccount: { type: 'string', nullable: true },
            toAccount: { type: 'string', nullable: true },
            userId: { type: 'string', format: 'uuid' }
          }
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            categoryId: { type: 'integer' },
            category: { type: 'string' },
            spent: { type: 'number' },
            budget: { type: 'number' },
            color: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Goal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            target: { type: 'number' },
            current: { type: 'number' },
            deadline: { type: 'string', format: 'date' },
            autoFill: { type: 'boolean' },
            autoFillPercentage: { type: 'number' },
            user: { type: 'string', format: 'uuid' }
          }
        },
        Debt: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            type: { type: 'string', enum: ['lend', 'borrow'] },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'] },
            dueDate: { type: 'string', format: 'date' },
            userId: { type: 'string', format: 'uuid' },
            contactId: { type: 'string', format: 'uuid' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            count: { type: 'integer' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    // Читать аннотации из роут файлов
    './src/routes/*.ts',
    './routes/*.js'
  ], // Пути к файлам с аннотациями
};

const specs = swaggerJSDoc(options);

console.log('🔍 Swagger specs generated:');
console.log('🔍 Paths found:', Object.keys(specs.paths || {}).length);
console.log('🔍 Available paths:', Object.keys(specs.paths || {}));
console.log('🔍 Tags found:', specs.tags?.length || 0);

export { swaggerUi, specs };
