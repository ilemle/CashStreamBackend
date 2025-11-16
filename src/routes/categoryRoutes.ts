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

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получить все категории с подкатегориями
 *     description: Возвращает все системные и пользовательские категории с их подкатегориями
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', protect, getCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Создать пользовательскую категорию
 *     description: Создает новую пользовательскую категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название категории
 *                 example: "Моя категория"
 *               icon:
 *                 type: string
 *                 description: Иконка категории (опционально)
 *                 example: "category"
 *     responses:
 *       201:
 *         description: Категория создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Ошибка валидации
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', protect, createUserCategory);

/**
 * @swagger
 * /categories/{categoryId}/subcategories:
 *   post:
 *     summary: Создать подкатегорию
 *     description: Создает новую подкатегорию для указанной категории
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID категории
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название подкатегории
 *                 example: "Моя подкатегория"
 *               icon:
 *                 type: string
 *                 description: Иконка подкатегории (опционально)
 *                 example: "subcategory"
 *     responses:
 *       201:
 *         description: Подкатегория создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Ошибка валидации
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Категория не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.post('/:categoryId/subcategories', protect, addSubcategory);

/**
 * @swagger
 * /categories/{categoryId}:
 *   delete:
 *     summary: Удалить пользовательскую категорию
 *     description: Удаляет пользовательскую категорию (системные категории удалить нельзя)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID категории
 *         example: 1
 *     responses:
 *       200:
 *         description: Категория удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет прав на удаление
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Категория не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:categoryId', protect, deleteUserCategory);

/**
 * @swagger
 * /categories/subcategories/{subcategoryId}:
 *   delete:
 *     summary: Удалить подкатегорию
 *     description: Удаляет подкатегорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкатегории
 *         example: 1
 *     responses:
 *       200:
 *         description: Подкатегория удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subcategory deleted successfully"
 *       401:
 *         description: Не авторизован
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Нет прав на удаление
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Подкатегория не найдена
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка сервера
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/subcategories/:subcategoryId', protect, deleteSubcategory);

export default router;

