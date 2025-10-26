import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: {
    [key: string]: { message: string };
  };
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

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 } as ErrorWithStatus;
  }

  // Mongoose duplicate key
  const mongooseError = err as any;
  if (mongooseError.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 } as ErrorWithStatus;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationError = err as unknown as MongooseValidationError;
    const message = Object.values(validationError.errors).map((val: any) => val.message);
    error = { message: message.join(', '), statusCode: 400 } as ErrorWithStatus;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler;

