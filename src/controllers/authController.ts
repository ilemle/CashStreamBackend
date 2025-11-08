import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import EmailVerification from '../models/EmailVerification';
import { sendVerificationEmail } from '../utils/emailService';
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

