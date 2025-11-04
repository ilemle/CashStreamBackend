import { Request, Response, NextFunction } from 'express';
import Operation, { IOperation } from '../models/Operation';
import Budget from '../models/Budget';
import Goal from '../models/Goal';
import { addCurrencyConversion, addCurrencyConversionToArray } from '../utils/responseFormatter';

// Вспомогательная функция для обновления бюджета
async function updateBudgetSpent(userId: string, category: string, amount: number, operation: 'add' | 'subtract') {
  try {
    // Извлекаем основную категорию (до " > ")
    // Например: "Путешествия > Авиабилеты" → "Путешествия"
    const mainCategory = category.includes(' > ') ? category.split(' > ')[0] : category;
    
    console.log(`🔍 Looking for budget: "${mainCategory}" (original: "${category}")`);
    
    // Находим бюджет по категории и пользователю
    const budgets = await Budget.find({ user: userId });
    const budget = budgets.find(b => b.category === mainCategory);
    
    if (!budget || !budget.id) {
      console.log(`⚠️ Budget not found for category: ${mainCategory}`);
      console.log(`📋 Available budgets:`, budgets.map(b => b.category));
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
    const goals = await Goal.find({ user: userId });
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
  try {
    const { startDate, endDate, timezoneOffset } = req.query;
    
    console.log('📅 Backend received dates:', { startDate, endDate, timezoneOffset, userId: req.user?.id });
    
    // Логируем несколько первых операций для отладки
    const debugOps = await Operation.find({ user: req.user?.id || '' });
    console.log('📋 Sample operations dates:', debugOps.slice(0, 3).map((op: IOperation) => ({ date: op.date, id: op.id })));
    
    // Строим базовый запрос
    const query: any = { user: req.user?.id || '' };
    
    // Добавляем фильтрацию по датам, если они переданы
    if (startDate || endDate) {
      query.date = {};
      
      // timezoneOffset приходит в минутах (например, -180 для UTC+3)
      // Нужно вычесть это смещение, чтобы получить UTC время начала/конца локального дня
      const offsetMinutes = timezoneOffset ? parseInt(String(timezoneOffset)) : 0;
      
      if (startDate) {
        // Парсим дату как UTC полночь, затем применяем offset
        const start = new Date(startDate + 'T00:00:00.000Z');
        // Добавляем offset (для UTC+3 offset = -180, добавляем -180, т.е. вычитаем 3 часа)
        // Это преобразует '28.10 00:00 UTC' → '27.10 21:00 UTC' (начало локального дня в UTC)
        start.setMinutes(start.getMinutes() + offsetMinutes);
        query.date.$gte = start;
        console.log('📅 Start date (UTC adjusted for local TZ):', start);
      }
      
      if (endDate) {
        // Парсим дату как UTC конец дня, затем применяем offset
        const end = new Date(endDate + 'T23:59:59.999Z');
        end.setMinutes(end.getMinutes() + offsetMinutes);
        query.date.$lte = end;
        console.log('📅 End date (UTC adjusted for local TZ):', end);
      }
    }
    
    console.log('📋 MySQL query filter:', JSON.stringify(query, null, 2));
    const ops = await Operation.find(query);
    console.log('📋 Found operations:', ops.length);
    const opsWithConversion = await addCurrencyConversionToArray(ops, req);
    res.status(200).json({ success: true, count: ops.length, data: opsWithConversion });
  } catch (err: any) {
    console.error('❌ Error fetching operations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const op = await Operation.findById(req.params.id);
    if (!op || op.user !== req.user?.id) {
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
    const opData: IOperation = {
      title: req.body.title,
      titleKey: req.body.titleKey,
      amount: req.body.amount,
      category: req.body.category,
      categoryKey: req.body.categoryKey,
      date: req.body.date || new Date(),
      timestamp: req.body.timestamp,
      type: req.body.type,
      fromAccount: req.body.fromAccount,
      toAccount: req.body.toAccount,
      currency: req.body.currency || 'RUB',  // Валюта операции
      user: req.user?.id || ''
    };
    const op = await Operation.create(opData);
    
    // Автоматически обновляем бюджет при создании операции расхода
    if (op.type === 'expense' && op.category && op.user) {
      await updateBudgetSpent(op.user, op.category, Math.abs(op.amount), 'add');
    }
    
    // Автоматически пополняем цели при создании операции дохода
    if (op.type === 'income' && op.user) {
      await autoFillGoals(op.user, Math.abs(op.amount));
    }
    
    const opWithConversion = await addCurrencyConversion(op, req);
    res.status(201).json({ success: true, data: opWithConversion });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Проверяем существование и владельца
    const existingOp = await Operation.findById(req.params.id);
    if (!existingOp) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    
    // Проверяем, что операция принадлежит текущему пользователю
    if (existingOp.user !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    // Если изменилась категория или сумма расхода, обновляем бюджеты
    const oldCategory = existingOp.category;
    const oldAmount = Math.abs(existingOp.amount);
    const oldType = existingOp.type;
    
    const newCategory = req.body.category || oldCategory;
    const newAmount = req.body.amount !== undefined ? Math.abs(req.body.amount) : oldAmount;
    const newType = req.body.type || oldType;
    
    // Откатываем старую операцию из бюджета (если была расходом)
    if (oldType === 'expense' && oldCategory && existingOp.user) {
      await updateBudgetSpent(existingOp.user, oldCategory, oldAmount, 'subtract');
    }
    
    // Откатываем автопополнение целей (если была доходом)
    // Примечание: мы не можем точно откатить, так как процент мог измениться,
    // поэтому просто логируем это
    if (oldType === 'income' && existingOp.user && newType !== 'income') {
      console.log(`⚠️ Operation type changed from income to ${newType}, goals were auto-filled and cannot be automatically reverted`);
    }
    
    // Обновляем операцию
    const op = await Operation.findByIdAndUpdate(req.params.id, req.body);
    
    // Добавляем новую операцию в бюджет (если расход)
    if (newType === 'expense' && newCategory && existingOp.user) {
      await updateBudgetSpent(existingOp.user, newCategory, newAmount, 'add');
    }
    
    // Автопополняем цели (если теперь доход и был не доходом)
    if (newType === 'income' && oldType !== 'income' && existingOp.user) {
      await autoFillGoals(existingOp.user, newAmount);
    }
    
    const opWithConversion = await addCurrencyConversion(op || existingOp, req);
    res.status(200).json({ success: true, data: opWithConversion });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteOperation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Проверяем существование и владельца
    const existingOp = await Operation.findById(req.params.id);
    if (!existingOp) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }
    
    if (existingOp.user !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    
    // Автоматически обновляем бюджет при удалении операции расхода
    if (existingOp.type === 'expense' && existingOp.category && existingOp.user) {
      await updateBudgetSpent(existingOp.user, existingOp.category, Math.abs(existingOp.amount), 'subtract');
    }
    
    await Operation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const ops = await Operation.find({ user: req.user?.id || '' });
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
      if (!op.title || op.amount === undefined || !op.category || !op.date || !op.type) {
        res.status(400).json({
          success: false,
          message: `Invalid operation: missing required fields (title, amount, category, date, type)`
        });
        return;
      }
    }

    console.log(`📦 Creating batch of ${operations.length} operations for user: ${req.user?.id}`);

    // Подготавливаем данные для создания
    const operationsData: IOperation[] = operations.map((op: any) => ({
      title: op.title,
      titleKey: op.titleKey || undefined,
      amount: op.amount,
      category: op.category,
      categoryKey: op.categoryKey || undefined,
      date: op.date,
      timestamp: op.timestamp || undefined,
      type: op.type,
      fromAccount: op.fromAccount || undefined,
      toAccount: op.toAccount || undefined,
      currency: op.currency || 'RUB',
      user: req.user?.id || ''
    }));

    // Создаем операции в транзакции
    const createdOperations = await Operation.createMany(operationsData);

    // Обновляем бюджеты и цели для каждой операции
    for (const op of createdOperations) {
      // Автоматически обновляем бюджет при создании операции расхода
      if (op.type === 'expense' && op.category && op.user) {
        await updateBudgetSpent(op.user, op.category, Math.abs(op.amount), 'add');
      }
      
      // Автоматически пополняем цели при создании операции дохода
      if (op.type === 'income' && op.user) {
        await autoFillGoals(op.user, Math.abs(op.amount));
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
