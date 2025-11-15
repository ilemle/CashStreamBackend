import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import EmailVerification from '../models/EmailVerification';
import PhoneVerification from '../models/PhoneVerification';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';
import { sendVerificationSMS, normalizePhoneNumber, validatePhoneNumber } from '../utils/smsService';
import { pool } from '../config/database';
import jwt from 'jsonwebtoken';
import { getBotUrl, getTelegramUserInfo, getBotUsername } from '../services/telegramService';
import TelegramAuthSession from '../models/TelegramAuthSession';
import { v4 as uuidv4 } from 'uuid';

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
    const { username, email, password } = req.body;
    console.log('📨 Request data:', { username, email, password: password ? '***' : 'missing' });

    // Валидация
    if (!username || !email || !password) {
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
    sendVerificationEmail(email, code, username)
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
    
    const { email, code, username, password } = req.body;
    
    console.log('📋 Входные данные:', {
      email: email || 'не указано',
      code: code || 'не указано',
      username: username || 'не указано',
      password: password ? '***' : 'не указано'
    });

    if (!email || !code || !username || !password) {
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
    const user = await User.create({ username, email, password } as IUser);
    const createTime = Date.now() - createStartTime;
    console.log(`⏱️ Пользователь создан за ${createTime}ms`);
    
    console.log('✅ Пользователь создан:', {
      id: user.id,
      username: user.username,
      email: user.email,
      idType: typeof user.id,
      idLength: user.id?.length
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
      userName: user.username,
      userEmail: user.email,
      tokenGenerated: true
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [VERIFY EMAIL & REGISTER] Регистрация успешна');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, username: user.username, email: user.email }, token }
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
    
    const { email, phone, password } = req.body;
    
    console.log('📋 Входные данные:', {
      email: email || 'не указано',
      phone: phone || 'не указано',
      password: password ? '***' : 'не указано'
    });

    if ((!email && !phone) || !password) {
      console.log('❌ Валидация не пройдена: отсутствуют email/phone или password');
      res.status(400).json({ success: false, message: 'Please provide email or phone and password' });
      return;
    }

    console.log('🔍 Поиск пользователя в базе данных...');
    const dbStartTime = Date.now();
    const user = await User.findOne(email ? { email } : { phone: normalizePhoneNumber(phone) });
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
      username: user.username,
      email: user.email,
      phone: user.phone
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
      userName: user.username,
      userEmail: user.email,
      userPhone: user.phone,
      tokenGenerated: true
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [LOGIN] Авторизация успешна');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(200).json({
      success: true,
      data: { user: { id: user.id, username: user.username, email: user.email, phone: user.phone }, token }
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
    sendPasswordResetEmail(email, code, user.username)
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
// Для пользователей с telegramId можно установить пароль без проверки старого
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

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide new password'
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

    // Получаем пользователя
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

    // Если у пользователя есть telegramId, можно установить пароль без проверки старого
    // Если нет telegramId, требуется текущий пароль для подтверждения
    if (!user.telegramId) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: 'Please provide current password'
        });
        return;
      }

      // Проверяем текущий пароль только для пользователей без telegramId
      const isMatch = await User.matchPassword(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }
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

// Удаление аккаунта (требует подтверждения паролем, кроме пользователей с telegramId)
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

    // Получаем пользователя
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

    // Если у пользователя есть telegramId, пароль не требуется
    // Если нет telegramId, требуется пароль для подтверждения
    if (!user.telegramId) {
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Please provide password to confirm account deletion'
        });
        return;
      }

      // Проверяем пароль только для пользователей без telegramId
      const isMatch = await User.matchPassword(password, user.password);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Password is incorrect'
        });
        return;
      }
    }

    // СНАЧАЛА удаляем все связанные данные (операции, бюджеты, цели, верификации)
    // Это нужно сделать ДО удаления пользователя из-за внешних ключей
    console.log('🗑️ Deleting user related data...');
    try {
      await pool.execute('DELETE FROM operations WHERE userId = ?', [userId]);
      console.log('✅ Operations deleted');
      
      await pool.execute('DELETE FROM budgets WHERE userId = ?', [userId]);
      console.log('✅ Budgets deleted');
      
      await pool.execute('DELETE FROM goals WHERE userId = ?', [userId]);
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

// Отправка SMS кода подтверждения для регистрации
export const sendPhoneVerificationCode = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    console.log('📱 Received send phone verification code request');
    const { name, phone, password } = req.body;
    console.log('📱 Request data:', { name, phone, password: password ? '***' : 'missing' });

    // Валидация
    if (!name || !phone || !password) {
      console.log('❌ Validation failed: missing fields');
      res.status(400).json({
        success: false,
        message: 'Please provide name, phone and password'
      });
      return;
    }

    // Нормализуем и валидируем номер телефона
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!validatePhoneNumber(normalizedPhone)) {
      console.log('❌ Invalid phone number format');
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
      return;
    }

    // Проверяем, не зарегистрирован ли уже пользователь
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      console.log('❌ User already exists');
      res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
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
    await PhoneVerification.create({
      phone: normalizedPhone,
      code,
      expiresAt,
      verified: false
    });
    console.log('✅ Verification code saved');

    // Отправляем SMS с кодом (не блокируем ответ, если SMS не отправится)
    console.log('📱 Attempting to send SMS...');
    sendVerificationSMS(normalizedPhone, code, name)
      .then(() => {
        console.log('✅ SMS sent successfully');
      })
      .catch((smsError: any) => {
        // В режиме разработки это нормально - код все равно будет в логах
        if (smsError.message?.includes('SMS_SERVICE_UNAVAILABLE')) {
          console.log('⚠️ SMS service unavailable, but code is saved and logged above');
        } else {
          console.error('❌ SMS sending error (non-blocking):', smsError.message || smsError);
        }
        // Не блокируем ответ, код уже сохранен в БД
      });

    // Отвечаем сразу, не дожидаясь отправки SMS
    console.log('✅ Sending response to client');
    res.status(200).json({
      success: true,
      message: 'Verification code sent to your phone',
      data: {
        phone: normalizedPhone,
        // В продакшене не отправляем код в ответе, только для тестирования
        ...(process.env.NODE_ENV === 'development' && { code })
      }
    });
    console.log('✅ Response sent');
  } catch (err: any) {
    console.error('❌ Send phone verification code error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to send verification code'
    });
  }
};

// Подтверждение телефона и завершение регистрации
export const verifyPhoneAndRegister = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const requestStartTime = Date.now();
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 [VERIFY PHONE & REGISTER] Запрос на подтверждение телефона и регистрацию');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { phone, code, username, password } = req.body;
    
    console.log('📋 Входные данные:', {
      phone: phone || 'не указано',
      code: code || 'не указано',
      username: username || 'не указано',
      password: password ? '***' : 'не указано'
    });

    if (!phone || !code || !username || !password) {
      console.log('❌ Валидация не пройдена: отсутствуют обязательные поля');
      res.status(400).json({
        success: false,
        message: 'Please provide phone, code, name and password'
      });
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!validatePhoneNumber(normalizedPhone)) {
      console.log('❌ Invalid phone number format');
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
      return;
    }

    console.log('🔍 Проверка кода подтверждения...');
    const verificationStartTime = Date.now();
    const verification = await PhoneVerification.findOne({ phone: normalizedPhone, code });
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
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      console.log('❌ Пользователь уже существует');
      const totalTime = Date.now() - requestStartTime;
      console.log(`⏱️ Общее время обработки: ${totalTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
      return;
    }

    console.log('✅ Пользователь не существует, создаем нового...');
    const createStartTime = Date.now();
    const user = await User.create({ username, phone: normalizedPhone, password } as IUser);
    const createTime = Date.now() - createStartTime;
    console.log(`⏱️ Пользователь создан за ${createTime}ms`);
    
    console.log('✅ Пользователь создан:', {
      id: user.id,
      username: user.username,
      phone: user.phone
    });

    console.log('💾 Отмечаем код как использованный...');
    await PhoneVerification.markAsVerified(normalizedPhone, code);
    console.log('✅ Код отмечен как использованный');

    console.log('🎫 Генерация JWT токена...');
    const tokenStartTime = Date.now();
    const token = generateToken(user.id!);
    const tokenTime = Date.now() - tokenStartTime;
    console.log(`⏱️ Токен сгенерирован за ${tokenTime}ms`);

    const totalTime = Date.now() - requestStartTime;
    console.log('📊 Результат регистрации:', {
      userId: user.id,
      userName: user.username,
      userPhone: user.phone,
      tokenGenerated: true
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [VERIFY PHONE & REGISTER] Регистрация успешна');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, username: user.username, phone: user.phone }, token }
    });
    return;
  } catch (err: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [VERIFY PHONE & REGISTER] Ошибка при регистрации');
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

// Получение URL Telegram бота для авторизации (с генерацией токена сессии)
export const getTelegramBotUrl = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  let retries = 5;
  while (retries > 0) {
    try {
      const botUrl = await getBotUrl();
      const username = await getBotUsername();
      
      if (!botUrl || !username) {
        res.status(503).json({
          success: false,
          message: 'Telegram bot is not available'
        });
        return;
      }
      
      // Генерируем уникальный токен сессии
      const sessionToken = uuidv4();
      
      // Создаем сессию (действительна 10 минут)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
      await TelegramAuthSession.create({
        sessionToken,
        telegramId: 0, // Будет обновлено ботом при нажатии кнопки
        expiresAt
      });
      
      // URL с токеном сессии
      const botAppUrl = `tg://resolve?domain=${username}&start=auth_${sessionToken}`;
      
      res.status(200).json({
        success: true,
        data: {
          botUrl, // Для веб-версии
          botAppUrl, // Для мобильного приложения (tg://)
          sessionToken // Токен для проверки авторизации
        }
      });
      return; // Успех, выходим из функции
    } catch (err: any) {
      console.error('❌ Get Telegram bot URL error:', err.message);
      if (err.code === 'ECONNREFUSED' && retries > 1) {
        retries--;
        console.warn(`⚠️ Retrying Telegram bot connection in 5 seconds... (${retries} retries left)`);
        await new Promise(resPromise => setTimeout(resPromise, 5000));
      } else {
        console.error('❌ All Telegram bot connection retries failed or other error occurred.');
        res.status(500).json({
          success: false,
          message: err.message || 'Failed to get Telegram bot URL'
        });
        return;
      }
    }
  }
};

// Проверка и авторизация через Telegram по токену сессии
export const checkTelegramAuth = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { sessionToken } = req.body;
    
    if (!sessionToken) {
      res.status(400).json({
        success: false,
        message: 'Session token is required'
      });
      return;
    }
    
    // Ищем сессию по токену
    const session = await TelegramAuthSession.findByToken(sessionToken);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found or expired. Please try again.'
      });
      return;
    }
    
    if (session.used) {
      res.status(400).json({
        success: false,
        message: 'Session already used. Please start a new authorization.'
      });
      return;
    }
    
    if (!session.userId) {
      res.status(404).json({
        success: false,
        message: 'User not found in session. Please press the button in the bot first.'
      });
      return;
    }
    
    // Получаем пользователя
    const user = await User.findById(session.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Получаем информацию о пользователе из Telegram
    const { getTelegramUserInfo } = await import('../services/telegramService');
    const userInfo = await getTelegramUserInfo(user.telegramId!);
    
    if (userInfo) {
      const name = userInfo.firstName 
        ? (userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : userInfo.firstName)
        : (userInfo.username || 'Telegram User');
      
      // Обновляем имя, если оно изменилось
      if (user.username !== name) {
        await pool.execute(
          'UPDATE users SET username = ? WHERE id = ?',
          [name, user.id]
        );
        user.username = name;
      }
    }
    
    // Генерируем токен
    const token = generateToken(user.id!);
    
    // Отмечаем сессию как использованную
    await TelegramAuthSession.markAsUsed(sessionToken);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          telegramId: user.telegramId
        },
        token
      }
    });
  } catch (err: any) {
    console.error('❌ Check Telegram auth error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to check Telegram authentication'
    });
  }
};

// Авторизация через Telegram
export const loginWithTelegram = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const requestStartTime = Date.now();
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 [TELEGRAM LOGIN] Запрос на авторизацию через Telegram');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { telegramId } = req.body;
    
    console.log('📋 Входные данные:', {
      telegramId: telegramId || 'не указано'
    });

    if (!telegramId) {
      console.log('❌ Валидация не пройдена: отсутствует telegramId');
      res.status(400).json({ 
        success: false, 
        message: 'Telegram ID is required' 
      });
      return;
    }

    // Получаем информацию о пользователе из Telegram Bot API
    let finalFirstName: string | undefined;
    let finalLastName: string | undefined;
    let finalUsername: string | undefined;
    
    const userInfo = await getTelegramUserInfo(Number(telegramId));
    if (userInfo) {
      finalFirstName = userInfo.firstName;
      finalLastName = userInfo.lastName;
      finalUsername = userInfo.username;
    }

    // Формируем имя пользователя
    const name = finalFirstName 
      ? (finalLastName ? `${finalFirstName} ${finalLastName}` : finalFirstName)
      : (finalUsername || 'Telegram User');

    console.log('🔍 Поиск пользователя в базе данных...');
    const dbStartTime = Date.now();
    let user = await User.findOne({ telegramId: Number(telegramId) });
    const dbTime = Date.now() - dbStartTime;
    console.log(`⏱️ Поиск пользователя выполнен за ${dbTime}ms`);

    if (!user) {
      console.log('✅ Пользователь не найден, создаем нового...');
      const createStartTime = Date.now();
      
      // Создаем нового пользователя без пароля (авторизация через Telegram)
      // Генерируем случайный пароль, который никогда не будет использован
      const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
      
      user = await User.create({
        username: name,
        telegramId: Number(telegramId),
        password: randomPassword
      } as IUser);
      
      const createTime = Date.now() - createStartTime;
      console.log(`⏱️ Пользователь создан за ${createTime}ms`);
      
      console.log('✅ Пользователь создан:', {
        id: user.id,
        username: user.username,
        telegramId: user.telegramId
      });
    } else {
      console.log('✅ Пользователь найден:', {
        id: user.id,
        username: user.username,
        telegramId: user.telegramId
      });
      
      // Обновляем имя, если оно изменилось
      if (user.username !== name) {
        console.log('🔄 Обновляем имя пользователя...');
        await pool.execute(
          'UPDATE users SET username = ? WHERE id = ?',
          [name, user.id]
        );
        user.username = name;
      }
    }

    console.log('🎫 Генерация JWT токена...');
    const tokenStartTime = Date.now();
    const token = generateToken(user.id!);
    const tokenTime = Date.now() - tokenStartTime;
    console.log(`⏱️ Токен сгенерирован за ${tokenTime}ms`);

    const totalTime = Date.now() - requestStartTime;
    console.log('📊 Результат авторизации через Telegram:', {
      userId: user.id,
      userName: user.username,
      telegramId: user.telegramId,
      tokenGenerated: true,
      isNewUser: !user.created_at || (Date.now() - new Date(user.created_at).getTime()) < 5000
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [TELEGRAM LOGIN] Авторизация успешна');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(200).json({
      success: true,
      data: { 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          phone: user.phone,
          telegramId: user.telegramId
        }, 
        token 
      }
    });
    return;
  } catch (err: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [TELEGRAM LOGIN] Ошибка при авторизации через Telegram');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Ошибка:', err.message);
    console.error('❌ Stack:', err.stack);
    console.error(`⏱️ Время до ошибки: ${totalTime}ms`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Telegram login failed' 
    });
    return;
  }
};

