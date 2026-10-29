/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Category,
  MonthlyBudgetConfig,
  MonthMetrics,
  RecurringPayment,
  Transaction,
  UserSettings,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_BUDGETS,
  DEFAULT_SETTINGS,
} from './constants';
import { getMonthKey, getPreviousMonthKey } from './calculations';

const STORAGE_KEYS = {
  TRANSACTIONS: 'spendwise_transactions_v1',
  CATEGORIES: 'spendwise_categories_v1',
  BUDGET_CONFIGS: 'spendwise_budgets_v1',
  RECURRING: 'spendwise_recurring_v1',
  SETTINGS: 'spendwise_settings_v1',
};

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
  budgetConfigs: Record<string, MonthlyBudgetConfig>;
  recurringPayments: RecurringPayment[];
  settings: UserSettings;
}

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function clearAllAppData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

/**
 * Generates rich, realistic demo data spanning current and previous month.
 */
export function generateDemoData(): {
  transactions: Transaction[];
  categories: Category[];
  budgetConfigs: Record<string, MonthlyBudgetConfig>;
  recurringPayments: RecurringPayment[];
  settings: UserSettings;
} {
  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const prevMonthKey = getPreviousMonthKey(currentMonthKey);

  const categories = [...DEFAULT_CATEGORIES];

  const budgetConfigs: Record<string, MonthlyBudgetConfig> = {
    [currentMonthKey]: {
      monthKey: currentMonthKey,
      overallBudget: 50000,
      categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS },
      carryForward: false,
    },
    [prevMonthKey]: {
      monthKey: prevMonthKey,
      overallBudget: 48000,
      categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS },
      carryForward: false,
    },
  };

  const settings: UserSettings = {
    ...DEFAULT_SETTINGS,
    hasCompletedOnboarding: true,
  };

  const recurringPayments: RecurringPayment[] = [
    {
      id: 'rec-1',
      name: 'Netflix & Spotify Family',
      amount: 1199,
      type: 'expense',
      categoryId: 'cat-subscriptions',
      categoryName: 'Subscriptions',
      paymentMethod: 'Credit Card',
      frequency: 'monthly',
      nextDueDate: `${currentMonthKey}-25`,
      notes: 'Digital media bundle',
    },
    {
      id: 'rec-2',
      name: 'Apartment Maintenance / Utility',
      amount: 4500,
      type: 'expense',
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      paymentMethod: 'UPI',
      frequency: 'monthly',
      nextDueDate: `${currentMonthKey}-10`,
      notes: 'Residential society dues',
    },
    {
      id: 'rec-3',
      name: 'High-speed Fiber Broadband',
      amount: 1416,
      type: 'expense',
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      paymentMethod: 'UPI',
      frequency: 'monthly',
      nextDueDate: `${currentMonthKey}-18`,
      notes: 'Work-from-home internet',
    },
    {
      id: 'rec-4',
      name: 'Cult.fit Gym & Fitness Membership',
      amount: 2200,
      type: 'expense',
      categoryId: 'cat-health',
      categoryName: 'Health & Medical',
      paymentMethod: 'Credit Card',
      frequency: 'monthly',
      nextDueDate: `${currentMonthKey}-28`,
      notes: 'Quarterly renews',
    },
    {
      id: 'rec-5',
      name: 'Freelance Design Retainer',
      amount: 25000,
      type: 'income',
      categoryId: 'cat-freelance',
      categoryName: 'Freelance',
      paymentMethod: 'Bank Transfer',
      frequency: 'monthly',
      nextDueDate: `${currentMonthKey}-15`,
      notes: 'Monthly UI retainer client',
    },
  ];

  const transactions: Transaction[] = [
    // Current Month Transactions
    {
      id: 'tx-c1',
      type: 'income',
      amount: 68000,
      categoryId: 'cat-salary',
      categoryName: 'Salary',
      date: `${currentMonthKey}-01`,
      paymentMethod: 'Bank Transfer',
      merchant: 'Tech Innovations Corp',
      notes: 'Monthly regular payroll',
      createdAt: Date.now() - 25 * 86400000,
    },
    {
      id: 'tx-c2',
      type: 'expense',
      amount: 6240,
      categoryId: 'cat-groceries',
      categoryName: 'Groceries',
      date: `${currentMonthKey}-02`,
      paymentMethod: 'UPI',
      merchant: 'Blinkit Superstore',
      notes: 'Monthly staples, olive oil & pantry items',
      createdAt: Date.now() - 24 * 86400000,
    },
    {
      id: 'tx-c3',
      type: 'expense',
      amount: 1450,
      categoryId: 'cat-food',
      categoryName: 'Food & Dining',
      date: `${currentMonthKey}-04`,
      paymentMethod: 'UPI',
      merchant: 'Toit Brewpub',
      notes: 'Dinner with college friends',
      createdAt: Date.now() - 22 * 86400000,
    },
    {
      id: 'tx-c4',
      type: 'expense',
      amount: 2800,
      categoryId: 'cat-transport',
      categoryName: 'Transport',
      date: `${currentMonthKey}-05`,
      paymentMethod: 'Credit Card',
      merchant: 'Indian Oil Fuel Station',
      notes: 'Full tank fuel for road trip',
      createdAt: Date.now() - 21 * 86400000,
    },
    {
      id: 'tx-c5',
      type: 'expense',
      amount: 3499,
      categoryId: 'cat-shopping',
      categoryName: 'Shopping',
      date: `${currentMonthKey}-07`,
      paymentMethod: 'Credit Card',
      merchant: 'Zara Apparels',
      notes: 'Office formal blazer',
      createdAt: Date.now() - 19 * 86400000,
    },
    {
      id: 'tx-c6',
      type: 'expense',
      amount: 4500,
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      date: `${currentMonthKey}-10`,
      paymentMethod: 'UPI',
      merchant: 'Apartment Society Admin',
      notes: 'Monthly maintenance payment',
      createdAt: Date.now() - 16 * 86400000,
    },
    {
      id: 'tx-c7',
      type: 'income',
      amount: 25000,
      categoryId: 'cat-freelance',
      categoryName: 'Freelance',
      date: `${currentMonthKey}-12`,
      paymentMethod: 'Bank Transfer',
      merchant: 'Nordic Studio Client',
      notes: 'Brand guide delivery',
      createdAt: Date.now() - 14 * 86400000,
    },
    {
      id: 'tx-c8',
      type: 'expense',
      amount: 890,
      categoryId: 'cat-food',
      categoryName: 'Food & Dining',
      date: `${currentMonthKey}-14`,
      paymentMethod: 'UPI',
      merchant: 'Third Wave Coffee',
      notes: 'Work session & iced lattes',
      createdAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx-c9',
      type: 'expense',
      amount: 1416,
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      date: `${currentMonthKey}-16`,
      paymentMethod: 'UPI',
      merchant: 'Airtel Xstream Fiber',
      notes: 'Monthly broadband bill',
      createdAt: Date.now() - 10 * 86400000,
    },
    {
      id: 'tx-c10',
      type: 'expense',
      amount: 1250,
      categoryId: 'cat-entertainment',
      categoryName: 'Entertainment',
      date: `${currentMonthKey}-18`,
      paymentMethod: 'Debit Card',
      merchant: 'PVR IMAX Theatres',
      notes: 'Movie tickets with family',
      createdAt: Date.now() - 8 * 86400000,
    },
    {
      id: 'tx-c11',
      type: 'expense',
      amount: 2450,
      categoryId: 'cat-groceries',
      categoryName: 'Groceries',
      date: `${currentMonthKey}-20`,
      paymentMethod: 'UPI',
      merchant: 'Nature Basket Organics',
      notes: 'Weekly fresh fruits & artisan cheese',
      createdAt: Date.now() - 6 * 86400000,
    },
    {
      id: 'tx-c12',
      type: 'expense',
      amount: 1850,
      categoryId: 'cat-health',
      categoryName: 'Health & Medical',
      date: `${currentMonthKey}-22`,
      paymentMethod: 'Credit Card',
      merchant: 'Apollo Pharmacy',
      notes: 'Supplements and vitamins',
      createdAt: Date.now() - 4 * 86400000,
    },
    {
      id: 'tx-c13',
      type: 'income',
      amount: 1200,
      categoryId: 'cat-refund',
      categoryName: 'Refund',
      date: `${currentMonthKey}-23`,
      paymentMethod: 'UPI',
      merchant: 'Amazon Marketplace',
      notes: 'Returned defective mouse pad',
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'tx-c14',
      type: 'expense',
      amount: 650,
      categoryId: 'cat-transport',
      categoryName: 'Transport',
      date: `${currentMonthKey}-24`,
      paymentMethod: 'UPI',
      merchant: 'Uber Ride',
      notes: 'Airport cab commute',
      createdAt: Date.now() - 2 * 86400000,
    },

    // Previous Month Transactions
    {
      id: 'tx-p1',
      type: 'income',
      amount: 68000,
      categoryId: 'cat-salary',
      categoryName: 'Salary',
      date: `${prevMonthKey}-01`,
      paymentMethod: 'Bank Transfer',
      merchant: 'Tech Innovations Corp',
      notes: 'Monthly regular payroll',
      createdAt: Date.now() - 55 * 86400000,
    },
    {
      id: 'tx-p2',
      type: 'expense',
      amount: 8400,
      categoryId: 'cat-groceries',
      categoryName: 'Groceries',
      date: `${prevMonthKey}-03`,
      paymentMethod: 'UPI',
      merchant: 'Zepto Supermarket',
      notes: 'Stocking supplies',
      createdAt: Date.now() - 53 * 86400000,
    },
    {
      id: 'tx-p3',
      type: 'expense',
      amount: 4500,
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      date: `${prevMonthKey}-08`,
      paymentMethod: 'UPI',
      merchant: 'Apartment Society Admin',
      notes: 'Maintenance dues',
      createdAt: Date.now() - 48 * 86400000,
    },
    {
      id: 'tx-p4',
      type: 'expense',
      amount: 4200,
      categoryId: 'cat-food',
      categoryName: 'Food & Dining',
      date: `${prevMonthKey}-12`,
      paymentMethod: 'Credit Card',
      merchant: 'Olive Beach Bistro',
      notes: 'Birthday dinner celebration',
      createdAt: Date.now() - 44 * 86400000,
    },
    {
      id: 'tx-p5',
      type: 'expense',
      amount: 3100,
      categoryId: 'cat-transport',
      categoryName: 'Transport',
      date: `${prevMonthKey}-15`,
      paymentMethod: 'UPI',
      merchant: 'Bharat Petroleum',
      notes: 'Fuel refill',
      createdAt: Date.now() - 41 * 86400000,
    },
    {
      id: 'tx-p6',
      type: 'expense',
      amount: 6800,
      categoryId: 'cat-shopping',
      categoryName: 'Shopping',
      date: `${prevMonthKey}-19`,
      paymentMethod: 'Credit Card',
      merchant: 'Apple Store Online',
      notes: 'Mechanical keyboard & cable',
      createdAt: Date.now() - 37 * 86400000,
    },
    {
      id: 'tx-p7',
      type: 'expense',
      amount: 2200,
      categoryId: 'cat-health',
      categoryName: 'Health & Medical',
      date: `${prevMonthKey}-22`,
      paymentMethod: 'Credit Card',
      merchant: 'Cult.fit Fitness',
      notes: 'Monthly gym dues',
      createdAt: Date.now() - 34 * 86400000,
    },
    {
      id: 'tx-p8',
      type: 'expense',
      amount: 1199,
      categoryId: 'cat-subscriptions',
      categoryName: 'Subscriptions',
      date: `${prevMonthKey}-25`,
      paymentMethod: 'Credit Card',
      merchant: 'Netflix India',
      notes: 'Streaming subscription',
      createdAt: Date.now() - 31 * 86400000,
    },
  ];

  return {
    transactions,
    categories,
    budgetConfigs,
    recurringPayments,
    settings,
  };
}

/**
 * Exports application data as clean JSON backup.
 */
export function exportDataAsJSON(data: AppDataBackup): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `spendwise_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exports transactions to CSV.
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  currencyCode: string,
  filename = 'spendwise_transactions.csv'
): void {
  const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Merchant', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    t.type.toUpperCase(),
    t.amount.toString(),
    currencyCode,
    `"${t.categoryName.replace(/"/g, '""')}"`,
    `"${t.merchant.replace(/"/g, '""')}"`,
    `"${t.paymentMethod}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exports a monthly budget & category spending summary to CSV.
 */
export function exportMonthlySummaryToCSV(
  metrics: MonthMetrics,
  currencyCode: string
): void {
  const headers = ['Category', 'Type', 'Spent Amount', 'Budget Limit', 'Remaining Amount', '% of Total Expense', 'Status'];
  const rows = metrics.categorySummaries.map((c) => [
    `"${c.categoryName.replace(/"/g, '""')}"`,
    'Expense',
    c.spent.toString(),
    c.budgetLimit.toString(),
    c.remaining.toString(),
    `${c.percentageOfTotalExpense.toFixed(1)}%`,
    c.status.toUpperCase(),
  ]);

  // Overall totals row
  rows.unshift([
    '"OVERALL MONTHLY TOTAL"',
    'All Expenses',
    metrics.totalExpenses.toString(),
    metrics.overallBudget.toString(),
    metrics.remainingBudget.toString(),
    '100%',
    metrics.budgetUtilization >= 100 ? 'EXCEEDED' : 'ON TRACK',
  ]);

  rows.unshift([
    '"OVERALL MONTHLY INCOME"',
    'All Income',
    metrics.totalIncome.toString(),
    '-',
    '-',
    '-',
    '-',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `spendwise_summary_${metrics.monthKey}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export { STORAGE_KEYS };
