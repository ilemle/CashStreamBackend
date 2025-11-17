import { Request, Response, NextFunction } from 'express';
import Operation, { IOperation } from '../models/Operation';
import Budget from '../models/Budget';
import Goal from '../models/Goal';
import { addCurrencyConversion, addCurrencyConversionToArray } from '../utils/responseFormatter';

// Вспомогательная функция для обновления бюджета
async function updateBudgetSpent(userId: string, categoryId: string | null, amount: number, operation: 'add' | 'subtract') {
  try {
    if (!categoryId) {
      console.log(`⚠️ No categoryId provided, skipping budget update`);
      return;
    }
    
    console.log(`🔍 Looking for budget with categoryId: "${categoryId}"`);
    
    // Находим бюджет по categoryId и пользователю
    const budgets = await Budget.find({ userId: userId });
    const budget = budgets.find(b => b.categoryId === categoryId);
    
    if (!budget || !budget.id) {
      console.log(`⚠️ Budget not found for categoryId: ${categoryId}`);
      console.log(`📋 Available budgets:`, budgets.map(b => ({ id: b.id, categoryId: b.categoryId, category: b.category })));
      return;
    }
    
    // Вычисляем новую сумму spent
    const delta = operation === 'add' ? amount : -amount;
    
    // Детальное логирование для отладки
    console.log(`📊 Budget calculation details:`);
    console.log(`  - Current spent: ${budget.spent} (type: ${typeof budget.spent})`);
    console.log(`  - Amount: ${amount} (type: ${typeof amount})`);
    console.log(`  - Operation: ${operation}`);
    console.log(`  - Delta: ${delta}`);
    console.log(`  - budget.spent + delta: ${budget.spent + delta}`);
    
    const newSpent = Math.max(0, Number(budget.spent) + delta); // Принудительно конвертируем в число
    
    console.log(`💰 Updating budget spent: ${budget.category} (${budget.spent} → ${newSpent})`);
    
    // Обновляем бюджет
    await Budget.findByIdAndUpdate(budget.id, { spent: newSpent });
    console.log(`✅ Budget updated successfully!`);
  } catch (error: any) {
    console.error('❌ Error updating budget:', error.message);
  }
}

// Вспомогательная функция для автопополнения целей при получении дохода
async function autoFillGoals(userId: string, incomeAmount: number) {
  try {
    console.log(`🎯 Checking auto-fill goals for user: ${userId}, income: ${incomeAmount}`);
    
    // Находим все цели с включенным автопополнением
    const goals = await Goal.find({ userId: userId });
    const autoFillGoals = goals.filter(g => g.autoFill && g.autoFillPercentage && g.autoFillPercentage > 0);
    
    if (autoFillGoals.length === 0) {
      console.log(`⚠️ No auto-fill goals found`);
      return;
    }
    
    console.log(`📋 Found ${autoFillGoals.length} auto-fill goals`);
    
    // Пополняем каждую цель
    for (const goal of autoFillGoals) {
      if (!goal.id) continue; // Пропускаем цели без ID
      
      const percentage = Number(goal.autoFillPercentage || 0);
      const fillAmount = (incomeAmount * percentage) / 100;
      const newCurrent = Number(goal.current) + fillAmount;
      
      // Не превышаем целевую сумму
      const finalAmount = Math.min(newCurrent, Number(goal.target));
      
      console.log(`💰 Auto-filling goal "${goal.title}":`);
      console.log(`  - Income: ${incomeAmount}, Percentage: ${percentage}%`);
      console.log(`  - Fill amount: ${fillAmount}`);
      console.log(`  - Current: ${goal.current} → ${finalAmount}`);
      
      await Goal.findByIdAndUpdate(goal.id, { current: finalAmount });
      console.log(`✅ Goal auto-filled successfully!`);
    }
  } catch (error: any) {
    console.error('❌ Error auto-filling goals:', error.message);
  }
}

export const getOperations = async (req: Request, res: Response, _next: NextFunction) => {
  const requestStartTime = Date.now();
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 [GET OPERATIONS] Запрос на получение операций');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { startDate, endDate, timezoneOffset, page, limit } = req.query;
    const userId = req.user?.id;
    
    console.log('📋 Входные параметры:', {
      startDate: startDate || 'не указано',
      endDate: endDate || 'не указано',
      timezoneOffset: timezoneOffset || 'не указано',
      page: page || 'не указано',
      limit: limit || 'не указано',
      userId: userId || 'не указано'
    });
    
    // Параметры пагинации
    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit ? parseInt(String(limit), 10) : 50; // По умолчанию 50 операций
    const skip = (pageNum - 1) * limitNum;
    
    console.log('📄 Параметры пагинации:', {
      page: pageNum,
      limit: limitNum,
      skip: skip
    });
    
    // Строим базовый запрос
    const language = (req.query.language as string) || 'ru'; // Язык для переводов категорий
    const query: any = { userId: userId || '', language };
    
    // Добавляем фильтрацию по датам, если они переданы
    if (startDate || endDate) {
      query.date = {};
      
      // timezoneOffset приходит в минутах (например, -180 для UTC+3)
      // Нужно вычесть это смещение, чтобы получить UTC время начала/конца локального дня
      const offsetMinutes = timezoneOffset ? parseInt(String(timezoneOffset)) : 0;
      console.log('🌍 Часовой пояс (offset в минутах):', offsetMinutes);
      
      if (startDate) {
        // Парсим дату как UTC полночь, затем применяем offset
        const start = new Date(startDate + 'T00:00:00.000Z');
        // Добавляем offset (для UTC+3 offset = -180, добавляем -180, т.е. вычитаем 3 часа)
        // Это преобразует '28.10 00:00 UTC' → '27.10 21:00 UTC' (начало локального дня в UTC)
        start.setMinutes(start.getMinutes() + offsetMinutes);
        query.date.$gte = start;
        console.log('📅 Начальная дата (UTC с учетом TZ):', start.toISOString());
      }
      
      if (endDate) {
        // Парсим дату как UTC конец дня, затем применяем offset
        const end = new Date(endDate + 'T23:59:59.999Z');
        end.setMinutes(end.getMinutes() + offsetMinutes);
        query.date.$lte = end;
        console.log('📅 Конечная дата (UTC с учетом TZ):', end.toISOString());
      }
    }
    
    console.log('🔍 Финальный query объект:', JSON.stringify(query, null, 2));
    console.log('⏱️ Начинаем запросы к базе данных...');
    
    const dbStartTime = Date.now();
    
    // Получаем общее количество операций для пагинации
    console.log('📊 Запрос COUNT для подсчета общего количества...');
    const countStartTime = Date.now();
    const total = await Operation.countDocuments(query);
    const countTime = Date.now() - countStartTime;
    console.log(`✅ COUNT запрос выполнен за ${countTime}ms, всего операций: ${total}`);
    
    // Добавляем параметры пагинации в query для модели
    const queryWithPagination = {
      ...query,
      skip,
      limit: limitNum
    };
    
    console.log('📋 Запрос SELECT с пагинацией:', {
      skip: queryWithPagination.skip,
      limit: queryWithPagination.limit
    });
    
    // Получаем операции с пагинацией, сортировка по дате (новые сначала)
    const selectStartTime = Date.now();
    const ops = await Operation.find(queryWithPagination);
    const selectTime = Date.now() - selectStartTime;
    
    const dbTime = Date.now() - dbStartTime;
    console.log(`✅ SELECT запрос выполнен за ${selectTime}ms, получено операций: ${ops.length}`);
    console.log(`⏱️ Общее время работы с БД: ${dbTime}ms`);
    
    if (ops.length > 0) {
      console.log('📝 Примеры операций:');
      ops.slice(0, 3).forEach((op, idx) => {
        console.log(`  ${idx + 1}. ${op.title} - ${op.amount} ${op.currency || 'RUB'} (${op.type}) - ${op.date}`);
      });
      if (ops.length > 3) {
        console.log(`  ... и еще ${ops.length - 3} операций`);
      }
    } else {
      console.log('⚠️ Операции не найдены');
    }
    
    console.log('💱 Начинаем конвертацию валют...');
    const conversionStartTime = Date.now();
    const opsWithConversion = await addCurrencyConversionToArray(ops, req);
    const conversionTime = Date.now() - conversionStartTime;
    console.log(`✅ Конвертация валют завершена за ${conversionTime}ms`);
    
    // Вычисляем метаданные пагинации
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    const totalTime = Date.now() - requestStartTime;
    console.log('📊 Метаданные пагинации:', {
      opsWithConversion,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage,
      hasPrevPage
    });
    console.log(`⏱️ Общее время обработки запроса: ${totalTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [GET OPERATIONS] Запрос успешно обработан');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return res.status(200).json({ 
      success: true, 
      count: ops.length,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data: opsWithConversion 
    });
  } catch (err: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [GET OPERATIONS] Ошибка при обработке запроса');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Ошибка:', err.message);
    console.error('❌ Stack:', err.stack);
    console.error(`⏱️ Время до ошибки: ${totalTime}ms`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch operations' });
  }
};

export const getOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const language = (req.query.language as string) || 'ru';
    const op = await Operation.findById(req.params.id, language);
    if (!op || op.userId !== req.user?.id) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    const opWithConversion = await addCurrencyConversion(op, req);
    res.status(200).json({ success: true, data: opWithConversion });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const language = (req.query.language as string) || (req.body.language as string) || 'ru';
    
    // Нормализуем categoryId и subcategoryId
    // Для transfer операций категория не нужна
    // Пустые строки и undefined преобразуем в null
    let categoryId: string | null = null;
    let subcategoryId: string | null = null;
    
    if (req.body.type === 'transfer') {
      // Для переводов категория не используется
      categoryId = null;
      subcategoryId = null;
    } else {
      // Для income и expense нормализуем значения
      categoryId = req.body.categoryId && req.body.categoryId.trim() !== '' 
        ? req.body.categoryId.trim() 
        : null;
      subcategoryId = req.body.subcategoryId && req.body.subcategoryId.trim() !== '' 
        ? req.body.subcategoryId.trim() 
        : null;
    }
    
    const opData: IOperation = {
      title: req.body.title,
      amount: req.body.amount,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      date:  new Date(),
      timestamp: req.body.timestamp,
      type: req.body.type,
      fromAccount: req.body.fromAccount,
      toAccount: req.body.toAccount,
      currency: req.body.currency || 'RUB',  // Валюта операции
      userId: req.user?.id || ''
    };
    const op = await Operation.create(opData, language);
    
    // Автоматически обновляем бюджет при создании операции расхода
    if (op.type === 'expense' && op.categoryId && op.userId) {
      await updateBudgetSpent(op.userId, op.categoryId, Math.abs(op.amount), 'add');
    }
    
    // Автоматически пополняем цели при создании операции дохода
    if (op.type === 'income' && op.userId) {
      await autoFillGoals(op.userId, Math.abs(op.amount));
    }
    
    const opWithConversion = await addCurrencyConversion(op, req);
    res.status(201).json({ success: true, data: opWithConversion });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const language = (req.query.language as string) || (req.body.language as string) || 'ru';
    // Проверяем существование и владельца
    const existingOp = await Operation.findById(req.params.id, language);
    if (!existingOp) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    
    // Проверяем, что операция принадлежит текущему пользователю
    if (existingOp.userId !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    // Если изменилась категория или сумма расхода, обновляем бюджеты
    const oldCategoryId = existingOp.categoryId;
    const oldAmount = Math.abs(existingOp.amount);
    const oldType = existingOp.type;
    
    // Нормализуем categoryId и subcategoryId при обновлении
    let newCategoryId: string | null = oldCategoryId;
    let newSubcategoryId: string | null = existingOp.subcategoryId || null;
    
    if (req.body.categoryId !== undefined) {
      if (req.body.type === 'transfer' || (req.body.type === undefined && oldType === 'transfer')) {
        // Для переводов категория не используется
        newCategoryId = null;
      } else {
        // Нормализуем значение
        newCategoryId = req.body.categoryId && String(req.body.categoryId).trim() !== '' 
          ? String(req.body.categoryId).trim() 
          : null;
      }
    }
    
    if (req.body.subcategoryId !== undefined) {
      if (req.body.type === 'transfer' || (req.body.type === undefined && oldType === 'transfer')) {
        // Для переводов подкатегория не используется
        newSubcategoryId = null;
      } else {
        // Нормализуем значение
        newSubcategoryId = req.body.subcategoryId && String(req.body.subcategoryId).trim() !== '' 
          ? String(req.body.subcategoryId).trim() 
          : null;
      }
    }
    
    const newAmount = req.body.amount !== undefined ? Math.abs(req.body.amount) : oldAmount;
    const newType = req.body.type || oldType;
    
    // Подготавливаем данные для обновления с нормализованными значениями
    const updateData = {
      ...req.body,
      categoryId: newCategoryId,
      subcategoryId: newSubcategoryId
    };
    
    // Откатываем старую операцию из бюджета (если была расходом)
    if (oldType === 'expense' && oldCategoryId && existingOp.userId) {
      await updateBudgetSpent(existingOp.userId, oldCategoryId, oldAmount, 'subtract');
    }
    
    // Откатываем автопополнение целей (если была доходом)
    // Примечание: мы не можем точно откатить, так как процент мог измениться,
    // поэтому просто логируем это
    if (oldType === 'income' && existingOp.userId && newType !== 'income') {
      console.log(`⚠️ Operation type changed from income to ${newType}, goals were auto-filled and cannot be automatically reverted`);
    }
    
    // Обновляем операцию
    const op = await Operation.findByIdAndUpdate(req.params.id, updateData, language);
    
    // Добавляем новую операцию в бюджет (если расход)
    if (newType === 'expense' && newCategoryId && existingOp.userId) {
      await updateBudgetSpent(existingOp.userId, newCategoryId, newAmount, 'add');
    }
    
    // Автопополняем цели (если теперь доход и был не доходом)
    if (newType === 'income' && oldType !== 'income' && existingOp.userId) {
      await autoFillGoals(existingOp.userId, newAmount);
    }
    
    const opWithConversion = await addCurrencyConversion(op || existingOp, req);
    res.status(200).json({ success: true, data: opWithConversion });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const language = (req.query.language as string) || 'ru';
    // Проверяем существование и владельца
    const existingOp = await Operation.findById(req.params.id, language);
    if (!existingOp) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    
    if (existingOp.userId !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    // Автоматически обновляем бюджет при удалении операции расхода
    if (existingOp.type === 'expense' && existingOp.categoryId && existingOp.userId) {
      await updateBudgetSpent(existingOp.userId, existingOp.categoryId, Math.abs(existingOp.amount), 'subtract');
    }
    
    await Operation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const ops = await Operation.find({ userId: req.user?.id || '' });
    const balance = ops.reduce((sum, op) => sum + Number(op.amount), 0);
    const balanceWithConversion = await addCurrencyConversion({ amount: balance } as IOperation, req);
    
    res.status(200).json({ 
      success: true, 
      data: { 
        balance, 
        convertedBalance: balanceWithConversion.convertedAmount,
        convertedCurrency: balanceWithConversion.convertedCurrency,
        convertedCurrencyCode: balanceWithConversion.convertedCurrencyCode,
        totalOperations: ops.length 
      } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOperationsBatch = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { operations } = req.body;

    // Валидация входных данных
    if (!Array.isArray(operations) || operations.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Operations array is required and must not be empty'
      });
      return;
    }

    // Валидация каждой операции
    for (const op of operations) {
      if (!op.title || op.amount === undefined || !op.date || !op.type) {
        res.status(400).json({
          success: false,
          message: `Invalid operation: missing required fields (title, amount, date, type). categoryId is optional but recommended.`
        });
        return;
      }
    }

    console.log(`📦 Creating batch of ${operations.length} operations for userId: ${req.user?.id}`);

    // Подготавливаем данные для создания с нормализацией categoryId и subcategoryId
    const operationsData: IOperation[] = operations.map((op: any) => {
      // Нормализуем categoryId и subcategoryId
      let categoryId: string | null = null;
      let subcategoryId: string | null = null;
      
      if (op.type === 'transfer') {
        // Для переводов категория не используется
        categoryId = null;
        subcategoryId = null;
      } else {
        // Для income и expense нормализуем значения
        categoryId = op.categoryId && String(op.categoryId).trim() !== '' 
          ? String(op.categoryId).trim() 
          : null;
        subcategoryId = op.subcategoryId && String(op.subcategoryId).trim() !== '' 
          ? String(op.subcategoryId).trim() 
          : null;
      }
      
      return {
        title: op.title,
        amount: op.amount,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        date: op.date,
        timestamp: op.timestamp || undefined,
        type: op.type,
        fromAccount: op.fromAccount || undefined,
        toAccount: op.toAccount || undefined,
        currency: op.currency || 'RUB',
        userId: req.user?.id || ''
      };
    });

    // Создаем операции в транзакции
    const language = (req.query.language as string) || (req.body.language as string) || 'ru';
    const createdOperations = await Operation.createMany(operationsData, language);

    // Обновляем бюджеты и цели для каждой операции
    for (const op of createdOperations) {
      // Автоматически обновляем бюджет при создании операции расхода
      if (op.type === 'expense' && op.categoryId && op.userId) {
        await updateBudgetSpent(op.userId, op.categoryId, Math.abs(op.amount), 'add');
      }
      
      // Автоматически пополняем цели при создании операции дохода
      if (op.type === 'income' && op.userId) {
        await autoFillGoals(op.userId, Math.abs(op.amount));
      }
    }

    // Добавляем конвертацию валют к результатам
    const opsWithConversion = await addCurrencyConversionToArray(createdOperations, req);

    console.log(`✅ Successfully created ${createdOperations.length} operations`);
    res.status(201).json({ success: true, data: opsWithConversion });
  } catch (err: any) {
    console.error('❌ Error creating batch operations:', err);
    res.status(500).json({ success: false, message: err.message || 'Error creating operations' });
  }
};
