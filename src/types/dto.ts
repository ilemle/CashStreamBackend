/**
 * Data Transfer Objects (DTO)
 * Объекты для передачи данных между слоями приложения
 * Отделяют внутреннюю структуру данных от API контрактов
 */

import { OperationType, DebtType } from './database';

// ============================================================================
// OPERATION DTO
// ============================================================================
export interface OperationCreateDTO {
  title: string;
  titleKey?: string;
  amount: number;
  category: string;
  categoryKey?: string;
  date: Date | string;
  timestamp?: number;
  type: OperationType;
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
  userId: string;
}

export interface OperationUpdateDTO {
  title?: string;
  titleKey?: string;
  amount?: number;
  category?: string;
  categoryKey?: string;
  date?: Date | string;
  timestamp?: number;
  type?: OperationType;
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
}

export interface OperationFilterDTO {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: OperationType;
  category?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// USER DTO
// ============================================================================
export interface UserCreateDTO {
  username: string;
  email?: string;
  phone?: string;
  telegramId?: number;
  password: string;
}

export interface UserUpdateDTO {
  username?: string;
  email?: string;
  phone?: string;
  telegramId?: number;
}

// ============================================================================
// BUDGET DTO
// ============================================================================
export interface BudgetCreateDTO {
  category: string;
  budget: number;
  color: string;
  userId: string;
}

export interface BudgetUpdateDTO {
  category?: string;
  budget?: number;
  color?: string;
  spent?: number;
}

// ============================================================================
// GOAL DTO
// ============================================================================
export interface GoalCreateDTO {
  title: string;
  target: number;
  deadline: Date | string;
  userId: string;
  autoFill?: boolean;
  autoFillPercentage?: number;
}

export interface GoalUpdateDTO {
  title?: string;
  target?: number;
  current?: number;
  deadline?: Date | string;
  autoFill?: boolean;
  autoFillPercentage?: number;
}

// ============================================================================
// DEBT DTO
// ============================================================================
export interface DebtCreateDTO {
  title: string;
  amount: number;
  currency: string;
  type: DebtType;
  person: string;
  dueDate: Date | string;
  userId: string;
}

export interface DebtUpdateDTO {
  title?: string;
  amount?: number;
  currency?: string;
  type?: DebtType;
  person?: string;
  dueDate?: Date | string;
  isPaid?: boolean;
  paidDate?: Date | string;
}

// ============================================================================
// CATEGORY DTO
// ============================================================================
export interface CategoryCreateDTO {
  name: string;
  icon?: string;
  userId: string;
}

export interface SubcategoryCreateDTO {
  categoryId: string;
  name: string;
  icon?: string;
}

