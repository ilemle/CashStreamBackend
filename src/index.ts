/// <reference types="./types/express" />
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import connectDB from './config/database';
import { swaggerUi, specs } from './config/swagger';

// Load environment variables
dotenv.config();

// Connect to database
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
console.log('📚 Setting up Swagger UI...');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true
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

// Serve admin panel static files in production
if (process.env.NODE_ENV === 'production') {
  const adminPath = path.join(__dirname, '../dist/admin');
  app.use(express.static(adminPath));
  
  // Serve admin panel for all non-API routes (SPA routing)
  // This must be before error handler but after API routes
  app.get('*', (req: Request, res: Response, next) => {
    // Don't serve admin for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    // Serve index.html for all other routes (SPA routing)
    return res.sendFile(path.join(adminPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  // 404 handler for development (admin runs on separate port)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });
}

// Error handler (must be last)
import errorHandler from './middleware/errorHandler';
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
});

export default app;

