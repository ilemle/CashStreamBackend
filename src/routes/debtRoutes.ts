import { Router } from 'express';
import {
  getDebts,
  getDebt,
  createDebt,
  updateDebt,
  deleteDebt,
  getOverdueDebts,
  markDebtAsPaid
} from '../controllers/debtController';
import { protect } from '../middleware/auth';

const router = Router();

// Все роуты требуют авторизации
router.use(protect);

router.get('/', getDebts);
router.get('/overdue', getOverdueDebts);
router.get('/:id', getDebt);
router.post('/', createDebt);
router.put('/:id', updateDebt);
router.delete('/:id', deleteDebt);
router.patch('/:id/paid', markDebtAsPaid);

export default router;

