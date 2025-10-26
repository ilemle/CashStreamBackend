import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface IDecodedToken {
  id: string;
}

// Middleware для защиты роутов
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Проверяем наличие токена в headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Извлекаем токен
    token = req.headers.authorization.split(' ')[1];
  }

  // Проверяем наличие токена
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
    return;
  }

  try {
    // Декодируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as IDecodedToken;
    (req as any).user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

