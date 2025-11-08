import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ErrorWithStatus = { ...err };
  error.message = err.message;

  console.error('❌ [ErrorHandler] Error:', err);
  console.error('❌ [ErrorHandler] Error name:', err.name);
  console.error('❌ [ErrorHandler] Error message:', err.message);
  console.error('❌ [ErrorHandler] Error stack:', err.stack);

  // MySQL duplicate key
  const mysqlError = err as any;
  
  // MySQL Error: Duplicate entry
  if (mysqlError.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 } as ErrorWithStatus;
  }

  // MySQL Error: Connection refused
  if (mysqlError.code === 'ECONNREFUSED') {
    const message = 'Database connection failed';
    error = { message, statusCode: 503 } as ErrorWithStatus;
  }

  // MySQL Error: Table doesn't exist
  if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
    const message = 'Database table not found';
    error = { message, statusCode: 500 } as ErrorWithStatus;
  }

  // Убеждаемся, что ответ еще не отправлен
  if (!res.headersSent) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export default errorHandler;
export { errorHandler };
