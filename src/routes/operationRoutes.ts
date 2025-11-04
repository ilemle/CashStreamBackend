import { Router } from 'express';
import { getOperations, getOperation, createOperation, updateOperation, deleteOperation, getBalance, createOperationsBatch } from '../controllers/operationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.route('/').get(getOperations).post(createOperation);
router.route('/batch').post(createOperationsBatch);
router.route('/balance').get(getBalance);
router.route('/:id').get(getOperation).put(updateOperation).delete(deleteOperation);

export default router;

