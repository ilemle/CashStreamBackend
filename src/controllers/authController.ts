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
        console.error('❌ Email sending error (non-blocking):', emailError);
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
  try {
    const { email, code, name, password } = req.body;

    if (!email || !code || !name || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email, code, name and password'
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

    // Проверяем, не зарегистрирован ли уже пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Создаем пользователя
    const user = await User.create({ name, email, password } as IUser);
    
    // Отмечаем код как использованный
    await EmailVerification.markAsVerified(email, code);

    // Генерируем токен
    const token = generateToken(user.id!);

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
  } catch (err: any) {
    console.error('Verify email and register error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Registration failed'
    });
  }
};

export const login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await User.matchPassword(password, user.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id!);

    res.status(200).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
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
        console.error('❌ Password reset email sending error (non-blocking):', emailError);
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

