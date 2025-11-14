/**
 * Типы для API запросов и ответов
 * Определяют структуру данных, передаваемых между клиентом и сервером
 */

import { OperationType, DebtType } from './database';

// ============================================================================
// COMMON API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number; // Количество элементов на текущей странице
  total: number; // Общее количество элементов
  page: number; // Текущая страница
  limit: number; // Элементов на странице
  totalPages: number; // Всего страниц
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: T[];
}

// ============================================================================
// OPERATIONS API
// ============================================================================

export interface OperationDTO {
  id: string;
  title: string;
  amount: number;
  categoryId?: string | null;
  subcategoryId?: string | null;
  // Названия категорий (получаются через JOIN)
  categoryName?: string;
  subcategoryName?: string;
  // Полный путь категории для обратной совместимости
  category?: string; // "Категория > Подкатегория"
  date: string; // ISO 8601
  timestamp?: number;
  type: OperationType;
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
  userId?: string;
  created_at?: string;
  // Конвертированная валюта (добавляется middleware)
  convertedAmount?: number;
  convertedCurrency?: string;
  convertedCurrencyCode?: string;
}

export interface CreateOperationRequest {
  title: string;
  amount: number;
  categoryId?: string | null; // ID категории
  subcategoryId?: string | null; // ID подкатегории (опционально)
  date?: string; // ISO 8601, по умолчанию текущая дата
  timestamp?: number;
  type: OperationType;
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
}

export interface UpdateOperationRequest {
  title?: string;
  amount?: number;
  categoryId?: string | null;
  subcategoryId?: string | null;
  date?: string;
  timestamp?: number;
  type?: OperationType;
  currency?: string;
  fromAccount?: string;
  toAccount?: string;
}

export interface GetOperationsQuery {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  timezoneOffset?: number; // минуты
  page?: number;
  limit?: number;
}

export interface GetOperationsResponse extends PaginatedResponse<OperationDTO> {}

export interface GetOperationResponse extends ApiResponse<OperationDTO> {}

export interface CreateOperationResponse extends ApiResponse<OperationDTO> {}

export interface UpdateOperationResponse extends ApiResponse<OperationDTO> {}

export interface CreateOperationsBatchRequest {
  operations: CreateOperationRequest[]; // Каждая операция должна иметь categoryId
}

export interface CreateOperationsBatchResponse extends ApiResponse<OperationDTO[]> {}

export interface BalanceResponse {
  success: boolean;
  data: {
    balance: number;
    totalOperations: number;
    convertedBalance?: number;
    convertedCurrency?: string;
    convertedCurrencyCode?: string;
  };
}

// ============================================================================
// AUTH API
// ============================================================================

export interface UserDTO {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  telegramId?: number;
  created_at?: string;
}

export interface RegisterSendCodeRequest {
  email: string;
}

export interface RegisterVerifyRequest {
  email: string;
  code: string;
  username: string;
  password: string;
}

export interface RegisterPhoneSendCodeRequest {
  phone: string;
}

export interface RegisterPhoneVerifyRequest {
  phone: string;
  code: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginResponse extends ApiResponse<{
  token: string;
  user: UserDTO;
}> {}

export interface GetMeResponse extends ApiResponse<UserDTO> {}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TelegramLoginRequest {
  authData: string; // JSON строка от Telegram
}

export interface TelegramLoginResponse extends ApiResponse<{
  token: string;
  user: UserDTO;
}> {}

// ============================================================================
// BUDGETS API
// ============================================================================

export interface BudgetDTO {
  id: string;
  category: string;
  spent: number;
  budget: number;
  color: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetRequest {
  category: string;
  budget: number;
  color: string;
}

export interface UpdateBudgetRequest {
  category?: string;
  budget?: number;
  color?: string;
  spent?: number;
}

export interface GetBudgetsResponse extends ApiResponse<BudgetDTO[]> {}

export interface GetBudgetResponse extends ApiResponse<BudgetDTO> {}

export interface CreateBudgetResponse extends ApiResponse<BudgetDTO> {}

export interface UpdateBudgetResponse extends ApiResponse<BudgetDTO> {}

// ============================================================================
// GOALS API
// ============================================================================

export interface GoalDTO {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string; // YYYY-MM-DD
  userId: string;
  autoFill?: boolean;
  autoFillPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalRequest {
  title: string;
  target: number;
  deadline: string; // YYYY-MM-DD
  autoFill?: boolean;
  autoFillPercentage?: number;
}

export interface UpdateGoalRequest {
  title?: string;
  target?: number;
  current?: number;
  deadline?: string;
  autoFill?: boolean;
  autoFillPercentage?: number;
}

export interface GetGoalsResponse extends ApiResponse<GoalDTO[]> {}

export interface GetGoalResponse extends ApiResponse<GoalDTO> {}

export interface CreateGoalResponse extends ApiResponse<GoalDTO> {}

export interface UpdateGoalResponse extends ApiResponse<GoalDTO> {}

// ============================================================================
// CATEGORIES API
// ============================================================================

export interface CategoryDTO {
  id: string; // UUID категории
  nameKey: string; // Ключ для переводов (например, 'category.food')
  name: string; // Переведенное название (из translations)
  icon?: string;
  isSystem: boolean;
  subcategories?: SubcategoryDTO[];
}

export interface SubcategoryDTO {
  id: string; // UUID подкатегории
  categoryId: string; // UUID категории
  nameKey: string; // Ключ для переводов (например, 'subcategory.groceries')
  name: string; // Переведенное название (из translations)
  icon?: string;
}

export interface GetCategoriesQuery {
  type?: 'income' | 'expense';
  language?: string; // ISO 639-1 код языка (ru, en, etc.), по умолчанию 'ru'
}

export interface GetCategoriesResponse extends ApiResponse<CategoryDTO[]> {}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
}

export interface CreateCategoryResponse extends ApiResponse<CategoryDTO> {}

export interface AddSubcategoryRequest {
  name: string;
  icon?: string;
}

export interface AddSubcategoryResponse extends ApiResponse<SubcategoryDTO> {}

// ============================================================================
// DEBTS API
// ============================================================================

export interface DebtDTO {
  id: string;
  title: string;
  amount: number;
  currency: string;
  type: DebtType;
  person: string;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  paidDate?: string; // YYYY-MM-DD
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDebtRequest {
  title: string;
  amount: number;
  currency?: string;
  type: DebtType;
  person: string;
  dueDate: string; // YYYY-MM-DD
}

export interface UpdateDebtRequest {
  title?: string;
  amount?: number;
  currency?: string;
  type?: DebtType;
  person?: string;
  dueDate?: string;
  isPaid?: boolean;
  paidDate?: string;
}

export interface GetDebtsResponse extends ApiResponse<DebtDTO[]> {}

export interface GetDebtResponse extends ApiResponse<DebtDTO> {}

export interface CreateDebtResponse extends ApiResponse<DebtDTO> {}

export interface UpdateDebtResponse extends ApiResponse<DebtDTO> {}

export interface GetOverdueDebtsResponse extends ApiResponse<DebtDTO[]> {}

// ============================================================================
// CURRENCY API
// ============================================================================

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate?: number; // Курс относительно базовой валюты
}

export interface GetCurrenciesResponse extends ApiResponse<CurrencyInfo[]> {}

export interface ConvertCurrencyRequest {
  amount: number;
  from: string;
  to: string;
}

export interface ConvertCurrencyResponse extends ApiResponse<{
  amount: number;
  convertedAmount: number;
  from: string;
  to: string;
  rate: number;
}> {}

