import { Router } from 'express';
import { 
  sendVerificationCode, 
  verifyEmailAndRegister, 
  login, 
  getMe,
  requestPasswordReset,
  resetPassword,
  changePassword,
  deleteAccount
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Регистрация
router.post('/register/send-code', sendVerificationCode);
router.post('/register/verify', verifyEmailAndRegister);

// Вход
router.post('/login', login);

// Восстановление пароля
router.post('/password/reset-request', requestPasswordReset);
router.post('/password/reset', resetPassword);

// Изменение пароля (требует авторизации)
router.post('/password/change', protect, changePassword);

// Удаление аккаунта (требует авторизации)
router.delete('/account', protect, deleteAccount);

// Получение информации о текущем пользователе
router.get('/me', protect, getMe);

export default router;

