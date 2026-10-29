/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, CurrencyConfig, PaymentMethod, UserSettings } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar (AUD)' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar (SGD)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', color: '#F97316', icon: 'Utensils' },
  { id: 'cat-groceries', name: 'Groceries', type: 'expense', color: '#10B981', icon: 'ShoppingCart' },
  { id: 'cat-transport', name: 'Transport', type: 'expense', color: '#0EA5E9', icon: 'Car' },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', color: '#A855F7', icon: 'ShoppingBag' },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', color: '#EF4444', icon: 'Zap' },
  { id: 'cat-education', name: 'Education', type: 'expense', color: '#6366F1', icon: 'GraduationCap' },
  { id: 'cat-health', name: 'Health & Medical', type: 'expense', color: '#14B8A6', icon: 'HeartPulse' },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', color: '#EC4899', icon: 'Film' },
  { id: 'cat-subscriptions', name: 'Subscriptions', type: 'expense', color: '#06B6D4', icon: 'Repeat' },
  { id: 'cat-other-exp', name: 'Other Expenses', type: 'expense', color: '#64748B', icon: 'MoreHorizontal' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Salary', type: 'income', color: '#059669', icon: 'Briefcase' },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', color: '#2563EB', icon: 'Laptop' },
  { id: 'cat-allowance', name: 'Allowance', type: 'income', color: '#D97706', icon: 'Gift' },
  { id: 'cat-refund', name: 'Refund', type: 'income', color: '#0D9488', icon: 'RotateCcw' },
  { id: 'cat-investment', name: 'Investment Income', type: 'income', color: '#7C3AED', icon: 'TrendingUp' },
  { id: 'cat-other-inc', name: 'Other Income', type: 'income', color: '#475569', icon: 'PlusCircle' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const DEFAULT_SETTINGS: UserSettings = {
  currencyCode: 'INR',
  defaultMonthlyBudget: 45000,
  defaultMonthlyIncomeTarget: 70000,
  theme: 'light',
  carryForwardBudgets: false,
  hasCompletedOnboarding: false,
};

export const DEFAULT_CATEGORY_BUDGETS: Record<string, number> = {
  'cat-food': 8000,
  'cat-groceries': 10000,
  'cat-transport': 4500,
  'cat-shopping': 6000,
  'cat-bills': 7500,
  'cat-education': 2000,
  'cat-health': 3000,
  'cat-entertainment': 2500,
  'cat-subscriptions': 1500,
};
