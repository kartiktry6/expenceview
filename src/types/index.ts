/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // ISO YYYY-MM-DD
  paymentMethod: PaymentMethod;
  merchant: string;
  notes?: string;
  createdAt: number;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringFrequency;
  nextDueDate: string; // YYYY-MM-DD
  endDate?: string;
  notes?: string;
  lastRecordedDate?: string;
}

export interface MonthlyBudgetConfig {
  monthKey: string; // "YYYY-MM"
  overallBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> limit
  carryForward?: boolean;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface UserSettings {
  currencyCode: string;
  defaultMonthlyBudget: number;
  defaultMonthlyIncomeTarget: number;
  theme: 'light' | 'dark';
  carryForwardBudgets: boolean;
  hasCompletedOnboarding: boolean;
}

export interface CategorySpendingSummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  spent: number;
  budgetLimit: number;
  remaining: number;
  percentageOfTotalExpense: number;
  percentageOfBudget: number;
  status: 'normal' | 'warning' | 'caution' | 'exceeded';
}

export interface MonthMetrics {
  monthKey: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  overallBudget: number;
  remainingBudget: number;
  budgetUtilization: number;
  savingsRate: number;
  categorySummaries: CategorySpendingSummary[];
  expenseTransactionCount: number;
  incomeTransactionCount: number;
  largestExpense: Transaction | null;
}

export interface MonthOverMonthComparison {
  currentExpenses: number;
  previousExpenses: number;
  expenseDelta: number;
  expenseChangePercent: number | null; // null if previous was 0
  currentIncome: number;
  previousIncome: number;
  incomeDelta: number;
  incomeChangePercent: number | null;
  currentNetCashFlow: number;
  previousNetCashFlow: number;
}

export interface SmartInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  description: string;
  calculationNote: string;
  metric?: string;
}
