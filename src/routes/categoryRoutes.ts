import express from 'express';
import {
  getCategories,
  createCategory,
  createSubcategory,
} from '../controllers/categoryController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Получить все категории (системные + пользовательские)
router.get('/', protect, getCategories);

// Создать пользовательскую категорию
router.post('/', protect, createCategory);

// Создать подкатегорию
router.post('/subcategories', protect, createSubcategory);

export default router;

