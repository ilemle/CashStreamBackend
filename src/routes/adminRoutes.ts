import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController';

const router = Router();

// Получение списка всех пользователей с пагинацией
// GET /api/admin/users?page=1&limit=10
router.get('/users', getAllUsers);

export default router;
