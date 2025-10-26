import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password } as IUser);
    const token = generateToken(user.id!);

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
  } catch (err: any) {
    res.status(400).json({
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

