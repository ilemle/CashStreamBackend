import { Router } from 'express';
import { chatWithAI, streamChatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

// Обычный чат (не стриминг)
router.post('/chat', protect, chatWithAI);

// Стриминг чат (для постепенной печати) - опционально
router.post('/chat/stream', protect, streamChatWithAI);

export default router;

