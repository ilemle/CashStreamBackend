import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to database
import connectDB from './config/database';
connectDB().catch(console.error);

// Initialize Telegram bot
import { initializeTelegramBot } from './services/telegramService';
initializeTelegramBot();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to CashStream API',
    version: '1.0.0',
    status: 'running',
    docs: 'http://localhost:3000/api-docs',
    raw_specs: 'http://localhost:3000/api-docs.json',
    debug: 'http://localhost:3000/debug/swagger',
    test_ui: 'http://localhost:3000/test-ui',
    test_endpoints: {
      simple: '/api/test/simple',
      auth: '/api/test',
      protected: '/api/test/protected'
    },
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      operations: '/api/operations',
      budgets: '/api/budgets',
      goals: '/api/goals',
      currencies: '/api/currencies',
      debts: '/api/debts'
    }
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Проверка здоровья сервера
 *     description: Возвращает статус сервера и timestamp
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Сервер работает
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Swagger Documentation
import { swaggerUi, specs } from './config/swagger';
console.log('📚 Setting up Swagger UI...');
console.log('📊 Generated specs paths:', Object.keys(specs.paths || {}));

// Raw specs endpoint for debugging
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Debug endpoint to check what Swagger sees
app.get('/debug/swagger', (_req, res) => {
  res.json({
    pathsCount: Object.keys(specs.paths || {}).length,
    paths: Object.keys(specs.paths || {}),
    tagsCount: specs.tags?.length || 0,
    tags: specs.tags?.map((t: any) => t.name) || [],
    hasSchemas: !!specs.components?.schemas,
    schemasCount: Object.keys(specs.components?.schemas || {}).length,
    info: specs.info,
    swaggerVersion: specs.swagger || specs.openapi
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: false,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// API Routes
import { currencyConverter } from './middleware/currency';
import authRoutes from './routes/authRoutes';
import operationRoutes from './routes/operationRoutes';
import budgetRoutes from './routes/budgetRoutes';
import goalRoutes from './routes/goalRoutes';
import currencyRoutes from './routes/currencyRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';
import debtRoutes from './routes/debtRoutes';
import testRoutes from './routes/testRoutes';

// Currency conversion middleware для всех API роутов
app.use('/api', currencyConverter);

app.use('/api/auth', authRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/test', testRoutes);

// Simple HTML page for testing API without Swagger UI
app.get('/test-ui', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>CashStream API Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        button { padding: 8px 16px; margin: 5px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; white-space: pre-wrap; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>CashStream API Test</h1>

    <div class="endpoint">
        <h3>GET /api/test/simple</h3>
        <button onclick="testEndpoint('/api/test/simple')">Test</button>
        <div id="result-simple"></div>
    </div>

    <div class="endpoint">
        <h3>GET /api/test</h3>
        <button onclick="testEndpoint('/api/test')">Test</button>
        <div id="result-test"></div>
    </div>

    <div class="endpoint">
        <h3>GET /debug/swagger</h3>
        <button onclick="testEndpoint('/debug/swagger')">Check Swagger</button>
        <div id="result-debug"></div>
    </div>

    <script>
        async function testEndpoint(url) {
            const resultDiv = document.getElementById('result-' + url.split('/').pop());
            resultDiv.innerHTML = 'Loading...';

            try {
                const response = await fetch(url);
                const data = await response.json();
                resultDiv.innerHTML = '<pre class="success">' +
                    'Status: ' + response.status + '\\n' +
                    JSON.stringify(data, null, 2) +
                    '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<pre class="error">Error: ' + error.message + '</pre>';
            }
        }
    </script>
</body>
</html>
  `);
  });

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🧪 Test UI: http://localhost:${PORT}/test-ui`);
});