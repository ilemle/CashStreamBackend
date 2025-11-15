import express from 'express';
import {
  getCategories,
  createUserCategory,
  addSubcategory,
  deleteUserCategory,
  deleteSubcategory,
} from '../controllers/categoryController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Получить все категории (системные + пользовательские)
router.get('/', protect, getCategories);

// Создать пользовательскую категорию
router.post('/', protect, createUserCategory);

// Добавить подкатегорию к категории
router.post('/:categoryId/subcategories', protect, addSubcategory);

// Удалить пользовательскую категорию
router.delete('/:categoryId', protect, deleteUserCategory);

// Удалить подкатегорию
router.delete('/subcategories/:subcategoryId', protect, deleteSubcategory);

export default router;

