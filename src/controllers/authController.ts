import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import EmailVerification from '../models/EmailVerification';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';
import { pool } from '../config/database';
import jwt from 'jsonwebtoken';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '7d',
  });
};

// Генерация 6-значного кода подтверждения
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Отправка кода подтверждения
export const sendVerificationCode = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    console.log('📨 Received send verification code request');
    const { name, email, password } = req.body;
    console.log('📨 Request data:', { name, email, password: password ? '***' : 'missing' });

    // Валидация
    if (!name || !email || !password) {
      console.log('❌ Validation failed: missing fields');
      res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
      return;
    }

    // Проверяем, не зарегистрирован ли уже пользователь
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Генерируем код подтверждения
    const code = generateVerificationCode();
    console.log('🔐 Generated verification code:', code);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Код действителен 10 минут

    // Сохраняем код в таблицу верификации
    console.log('💾 Saving verification code to database...');
    await EmailVerification.create({
      email,
      code,
      expiresAt,
      verified: false
    });
    console.log('✅ Verification code saved');

    // Отправляем email с кодом (не блокируем ответ, если email не отправится)
    console.log('📧 Attempting to send email...');
    sendVerificationEmail(email, code, name)
      .then(() => {
        console.log('✅ Email sent successfully');
      })
      .catch((emailError: any) => {
        // В режиме разработки это нормально - код все равно будет в логах
        if (emailError.message?.includes('EMAIL_SERVICE_UNAVAILABLE')) {
          console.log('⚠️ Email service unavailable, but code is saved and logged above');
        } else {
          console.error('❌ Email sending error (non-blocking):', emailError.message || emailError);
        }
        // Не блокируем ответ, код уже сохранен в БД
      });

    // Отвечаем сразу, не дожидаясь отправки email
    console.log('✅ Sending response to client');
    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email,
        // В продакшене не отправляем код в ответе, только для тестирования
        ...(process.env.NODE_ENV === 'development' && { code })
      }
    });
    console.log('✅ Response sent');
  } catch (err: any) {
    console.error('❌ Send verification code error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to send verification code'
    });
  }
};

// Подтверждение email и завершение регистрации
export const verifyEmailAndRegister = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const requestStartTime = Date.now();
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [VERIFY EMAIL & REGISTER] Запрос на подтверждение email и регистрацию');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { email, code, name, password } = req.body;
    
    console.log('📋 Входные данные:', {
      email: email || 'не указано',
      code: code || 'не указано',
      name: name || 'не указано',
      password: password ? '***' : 'не указано'
    });

    if (!email || !code || !name || !password) {
      console.log('❌ Валидация не пройдена: отсутствуют обязательные поля');
      res.status(400).json({
        success: false,
        message: 'Please provide email, code, name and password'
      });
      return;
    }

    console.log('🔍 Проверка кода подтверждения...');
    const verificationStartTime = Date.now();
    const verification = await EmailVerification.findOne({ email, code });
    const verificationTime = Date.now() - verificationStartTime;
    console.log(`⏱️ Проверка кода выполнена за ${verificationTime}ms`);

    if (!verification) {
      console.log('❌ Код подтверждения не найден');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    if (verification.verified) {
      console.log('❌ Код уже использован');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(400).json({
        success: false,
        message: 'This code has already been used'
      });
      return;
    }

    if (new Date(verification.expiresAt) < new Date()) {
      console.log('❌ Код истек');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
      return;
    }

    console.log('✅ Код подтверждения валиден');

    console.log('🔍 Проверка существования пользователя...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Пользователь уже существует');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    console.log('✅ Пользователь не существует, создаем нового...');
    const createStartTime = Date.now();
    const user = await User.create({ name, email, password } as IUser);
    const createTime = Date.now() - createStartTime;
    console.log(`⏱️ Пользователь создан за ${createTime}ms`);
    
    console.log('✅ Пользователь создан:', {
      id: user.id,
      name: user.name,
      email: user.email
    });

    console.log('💾 Отмечаем код как использованный...');
    await EmailVerification.markAsVerified(email, code);
    console.log('✅ Код отмечен как использованный');

    console.log('🎫 Генерация JWT токена...');
    const tokenStartTime = Date.now();
    const token = generateToken(user.id!);
    const tokenTime = Date.now() - tokenStartTime;
    console.log(`⏱️ Токен сгенерирован за ${tokenTime}ms`);

    const totalTime = Date.now() - requestStartTime;
    console.log('📊 Результат регистрации:', {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      tokenGenerated: true
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [VERIFY EMAIL & REGISTER] Регистрация успешна');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
    return;
  } catch (err: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [VERIFY EMAIL & REGISTER] Ошибка при регистрации');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Ошибка:', err.message);
    console.error('❌ Stack:', err.stack);
    console.error(`⏱️ Время до ошибки: ${totalTime}ms`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.status(500).json({
      success: false,
      message: err.message || 'Registration failed'
    });
    return;
  }
};

export const login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const requestStartTime = Date.now();
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [LOGIN] Запрос на авторизацию');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { email, password } = req.body;
    
    console.log('📋 Входные данные:', {
      email: email || 'не указано',
      password: password ? '***' : 'не указано'
    });

    if (!email || !password) {
      console.log('❌ Валидация не пройдена: отсутствуют email или password');
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    console.log('🔍 Поиск пользователя в базе данных...');
    const dbStartTime = Date.now();
    const user = await User.findOne({ email });
    const dbTime = Date.now() - dbStartTime;
    console.log(`⏱️ Поиск пользователя выполнен за ${dbTime}ms`);

    if (!user) {
      console.log('❌ Пользователь не найден');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    console.log('✅ Пользователь найден:', {
      id: user.id,
      name: user.name,
      email: user.email
    });

    console.log('🔐 Проверка пароля...');
    const passwordCheckStartTime = Date.now();
    const isMatch = await User.matchPassword(password, user.password);
    const passwordCheckTime = Date.now() - passwordCheckStartTime;
    console.log(`⏱️ Проверка пароля выполнена за ${passwordCheckTime}ms`);

    if (!isMatch) {
      console.log('❌ Пароль неверный');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    console.log('✅ Пароль верный');
    console.log('🎫 Генерация JWT токена...');
    const tokenStartTime = Date.now();
    const token = generateToken(user.id!);
    const tokenTime = Date.now() - tokenStartTime;
    console.log(`⏱️ Токен сгенерирован за ${tokenTime}ms`);

    const totalTime = Date.now() - requestStartTime;
    console.log('📊 Результат авторизации:', {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      tokenGenerated: true
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [LOGIN] Авторизация успешна');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(200).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
    return;
  } catch (err: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [LOGIN] Ошибка при авторизации');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Ошибка:', err.message);
    console.error('❌ Stack:', err.stack);
    console.error(`⏱️ Время до ошибки: ${totalTime}ms`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
    return;
  }
};

export const getMe = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id || '');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get user' });
  }
};

// Запрос на восстановление пароля
export const requestPasswordReset = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    console.log('📨 Received password reset request');
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
      return;
    }

    // Проверяем, существует ли пользователь
    const user = await User.findOne({ email });
    if (!user) {
      // Для безопасности не сообщаем, что пользователь не найден
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent'
      });
      return;
    }

    // Генерируем код подтверждения
    const code = generateVerificationCode();
    console.log('🔐 Generated password reset code:', code);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Код действителен 10 минут

    // Сохраняем код в таблицу верификации
    console.log('💾 Saving password reset code to database...');
    await EmailVerification.create({
      email,
      code,
      expiresAt,
      verified: false
    });
    console.log('✅ Password reset code saved');

    // Отправляем email с кодом (не блокируем ответ)
    console.log('📧 Attempting to send password reset email...');
    sendPasswordResetEmail(email, code, user.name)
      .then(() => {
        console.log('✅ Password reset email sent successfully');
      })
      .catch((emailError: any) => {
        // В режиме разработки это нормально - код все равно будет в логах
        if (emailError.message?.includes('EMAIL_SERVICE_UNAVAILABLE')) {
          console.log('⚠️ Email service unavailable, but code is saved and logged above');
        } else {
          console.error('❌ Password reset email sending error (non-blocking):', emailError.message || emailError);
        }
      });

    // Отвечаем сразу
    console.log('✅ Sending response to client');
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset code has been sent',
      data: {
        email,
        // В продакшене не отправляем код в ответе, только для тестирования
        ...(process.env.NODE_ENV === 'development' && { code })
      }
    });
    console.log('✅ Response sent');
  } catch (err: any) {
    console.error('❌ Request password reset error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to send password reset code'
    });
  }
};

// Подтверждение кода и сброс пароля
export const resetPassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide email, code and new password'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Проверяем код подтверждения
    const verification = await EmailVerification.findOne({ email, code });

    if (!verification) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
      return;
    }

    if (verification.verified) {
      res.status(400).json({
        success: false,
        message: 'This code has already been used'
      });
      return;
    }

    if (new Date(verification.expiresAt) < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
      return;
    }

    // Проверяем, существует ли пользователь
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Обновляем пароль
    await User.updatePassword(user.id!, newPassword);
    
    // Отмечаем код как использованный
    await EmailVerification.markAsVerified(email, code);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to reset password'
    });
  }
};

// Изменение пароля (для авторизованных пользователей)
export const changePassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
      return;
    }

    // Получаем пользователя с паролем
    if (!pool) {
      res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
      return;
    }

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    const users = rows as IUser[];
    const user = users[0];

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Проверяем текущий пароль
    const isMatch = await User.matchPassword(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Обновляем пароль
    await User.updatePassword(userId, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password has been changed successfully'
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to change password'
    });
  }
};

// Удаление аккаунта (требует подтверждения паролем)
export const deleteAccount = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Please provide password to confirm account deletion'
      });
      return;
    }

    // Получаем пользователя с паролем
    if (!pool) {
      res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
      return;
    }

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    const users = rows as IUser[];
    const user = users[0];

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Проверяем пароль
    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
      return;
    }

    // СНАЧАЛА удаляем все связанные данные (операции, бюджеты, цели, верификации)
    // Это нужно сделать ДО удаления пользователя из-за внешних ключей
    console.log('🗑️ Deleting user related data...');
    try {
      await pool.execute('DELETE FROM operations WHERE user = ?', [userId]);
      console.log('✅ Operations deleted');
      
      await pool.execute('DELETE FROM budgets WHERE user = ?', [userId]);
      console.log('✅ Budgets deleted');
      
      await pool.execute('DELETE FROM goals WHERE user = ?', [userId]);
      console.log('✅ Goals deleted');
      
      await pool.execute('DELETE FROM email_verifications WHERE email = ?', [user.email]);
      console.log('✅ Email verifications deleted');
      
      // Также удаляем категории пользователя, если таблица существует
      try {
        await pool.execute('DELETE FROM categories WHERE userId = ?', [userId]);
        console.log('✅ User categories deleted');
      } catch (categoryError: any) {
        // Игнорируем ошибку, если таблица не существует
        if (categoryError.code !== 'ER_NO_SUCH_TABLE') {
          console.warn('⚠️ Could not delete user categories:', categoryError.message);
        } else {
          console.log('ℹ️ Categories table does not exist, skipping');
        }
      }
    } catch (cleanupError: any) {
      console.error('❌ Error cleaning up user data:', cleanupError);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user data: ' + cleanupError.message
      });
      return;
    }

    // ТЕПЕРЬ удаляем пользователя (после удаления всех связанных данных)
    console.log('🗑️ Deleting user account...');
    const deleted = await User.delete(userId);
    
    if (!deleted) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
      return;
    }
    
    console.log('✅ User account deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Account has been deleted successfully'
    });
  } catch (err: any) {
    console.error('Delete account error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete account'
    });
  }
};

