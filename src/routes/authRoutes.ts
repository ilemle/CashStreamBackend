import { Router } from 'express';
import { sendVerificationCode, verifyEmailAndRegister, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Отправка кода подтверждения
router.post('/register/send-code', sendVerificationCode);
// Подтверждение email и завершение регистрации
router.post('/register/verify', verifyEmailAndRegister);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;

