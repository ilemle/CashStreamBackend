const jwt = require('jsonwebtoken');

// Middleware для защиты роутов
exports.protect = async (req, res, next) => {
  let token;

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
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Декодируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

