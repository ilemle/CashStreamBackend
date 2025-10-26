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

  console.error(err);

  // MySQL duplicate key
  const mysqlError = err as any;
  
  // MySQL Error: Duplicate entry
  if (mysqlError.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 } as ErrorWithStatus;
  }

  // MySQL Error: Row not found
  if (mysqlError.code === 'ECONNREFUSED') {
    const message = 'Database connection failed';
    error = { message, statusCode: 503 } as ErrorWithStatus;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler;
