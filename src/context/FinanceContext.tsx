/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Category,
  MonthlyBudgetConfig,
  MonthMetrics,
  MonthOverMonthComparison,
  RecurringPayment,
  SmartInsight,
  Transaction,
  UserSettings,
} from '../types';
import {
  calculateMonthMetrics,
  calculateMonthOverMonth,
  generateSmartInsights,
  getMonthKey,
  getNextMonthKey,
  getPreviousMonthKey,
} from '../utils/calculations';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_BUDGETS,
  DEFAULT_SETTINGS,
} from '../utils/constants';
import {
  AppDataBackup,
  clearAllAppData,
  generateDemoData,
  loadStoredData,
  saveStoredData,
  STORAGE_KEYS,
} from '../utils/storage';

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FinanceContextValue {
  transactions: Transaction[];
  categories: Category[];
  budgetConfigs: Record<string, MonthlyBudgetConfig>;
  recurringPayments: RecurringPayment[];
  settings: UserSettings;
  activeMonthKey: string;
  activeMetrics: MonthMetrics;
  previousMetrics: MonthMetrics;
  comparison: MonthOverMonthComparison;
  smartInsights: SmartInsight[];
  toast: ToastNotification | null;
  undoAvailable: boolean;

  // Month navigation
  setActiveMonthKey: (key: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;

  // Transaction mutations
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoLastDelete: () => void;

  // Budgets
  updateOverallBudget: (monthKey: string, amount: number) => void;
  updateCategoryBudget: (monthKey: string, categoryId: string, limit: number) => void;
  setCategoryBudgets: (monthKey: string, budgets: Record<string, number>) => void;
  toggleCarryForward: (monthKey: string, enabled: boolean) => void;

  // Recurring Payments
  addRecurringPayment: (data: Omit<RecurringPayment, 'id'>) => void;
  updateRecurringPayment: (id: string, data: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;
  recordRecurringPaymentAsPaid: (id: string) => void;

  // Categories
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => boolean;

  // Settings & System
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  importData: (backup: AppDataBackup) => boolean;
  showToast: (message: string, action?: { label: string; onClick: () => void }) => void;
  dismissToast: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we should initialize with demo data or clean defaults
  const initialSettings = loadStoredData<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [categories, setCategories] = useState<Category[]>(() =>
    loadStoredData<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStoredData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
  );
  const [budgetConfigs, setBudgetConfigs] = useState<Record<string, MonthlyBudgetConfig>>(() =>
    loadStoredData<Record<string, MonthlyBudgetConfig>>(STORAGE_KEYS.BUDGET_CONFIGS, {})
  );
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(() =>
    loadStoredData<RecurringPayment[]>(STORAGE_KEYS.RECURRING, [])
  );

  // Active Month: default to current calendar month
  const currentCalendarMonth = getMonthKey(new Date());
  const [activeMonthKey, setActiveMonthKey] = useState<string>(currentCalendarMonth);

  // Toast & Undo buffer
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [deletedTxBuffer, setDeletedTxBuffer] = useState<Transaction | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Sync state to localStorage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.BUDGET_CONFIGS, budgetConfigs);
  }, [budgetConfigs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.RECURRING, recurringPayments);
  }, [recurringPayments]);

  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString();
    setToast({ id, message, action });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Month navigation helpers
  const goToPreviousMonth = () => {
    setActiveMonthKey((curr) => getPreviousMonthKey(curr));
  };

  const goToNextMonth = () => {
    setActiveMonthKey((curr) => getNextMonthKey(curr));
  };

  const goToCurrentMonth = () => {
    setActiveMonthKey(currentCalendarMonth);
  };

  // Active budget configuration for current selected month
  const activeBudgetConfig = useMemo((): MonthlyBudgetConfig => {
    if (budgetConfigs[activeMonthKey]) {
      return budgetConfigs[activeMonthKey];
    }
    // Fallback default for that month
    return {
      monthKey: activeMonthKey,
      overallBudget: settings.defaultMonthlyBudget,
      categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS },
      carryForward: settings.carryForwardBudgets,
    };
  }, [budgetConfigs, activeMonthKey, settings.defaultMonthlyBudget, settings.carryForwardBudgets]);

  const prevMonthKey = getPreviousMonthKey(activeMonthKey);
  const previousBudgetConfig = budgetConfigs[prevMonthKey];

  // Calculated Metrics
  const activeMetrics = useMemo(() => {
    return calculateMonthMetrics(transactions, activeMonthKey, categories, activeBudgetConfig, settings);
  }, [transactions, activeMonthKey, categories, activeBudgetConfig, settings]);

  const previousMetrics = useMemo(() => {
    return calculateMonthMetrics(transactions, prevMonthKey, categories, previousBudgetConfig, settings);
  }, [transactions, prevMonthKey, categories, previousBudgetConfig, settings]);

  const comparison = useMemo(() => {
    return calculateMonthOverMonth(transactions, activeMonthKey, prevMonthKey);
  }, [transactions, activeMonthKey, prevMonthKey]);

  const smartInsights = useMemo(() => {
    return generateSmartInsights(activeMetrics, comparison, recurringPayments, settings);
  }, [activeMetrics, comparison, recurringPayments, settings]);

  // Transaction mutations
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Added ${data.type === 'expense' ? 'expense' : 'income'}: ${data.merchant}`);
    return newTx;
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    showToast('Transaction updated');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    setDeletedTxBuffer(target);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    showToast(`Deleted "${target.merchant}"`, {
      label: 'Undo',
      onClick: () => {
        undoLastDelete();
      },
    });
  };

  const undoLastDelete = () => {
    if (!deletedTxBuffer) return;
    setTransactions((prev) => [deletedTxBuffer, ...prev]);
    showToast(`Restored "${deletedTxBuffer.merchant}"`);
    setDeletedTxBuffer(null);
  };

  // Budget modifications
  const updateOverallBudget = (monthKey: string, amount: number) => {
    setBudgetConfigs((prev) => {
      const existing = prev[monthKey] || {
        monthKey,
        overallBudget: settings.defaultMonthlyBudget,
        categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS },
      };
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          overallBudget: Math.max(0, amount),
        },
      };
    });
    showToast('Overall monthly budget updated');
  };

  const updateCategoryBudget = (monthKey: string, categoryId: string, limit: number) => {
    setBudgetConfigs((prev) => {
      const existing = prev[monthKey] || {
        monthKey,
        overallBudget: settings.defaultMonthlyBudget,
        categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS },
      };
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          categoryBudgets: {
            ...existing.categoryBudgets,
            [categoryId]: Math.max(0, limit),
          },
        },
      };
    });
    showToast('Category budget updated');
  };

  const setCategoryBudgets = (monthKey: string, budgets: Record<string, number>) => {
    setBudgetConfigs((prev) => {
      const existing = prev[monthKey] || {
        monthKey,
        overallBudget: settings.defaultMonthlyBudget,
        categoryBudgets: {},
      };
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          categoryBudgets: budgets,
        },
      };
    });
    showToast('Budgets saved successfully');
  };

  const toggleCarryForward = (monthKey: string, enabled: boolean) => {
    setBudgetConfigs((prev) => {
      const existing = prev[monthKey] || {
        monthKey,
        overallBudget: settings.defaultMonthlyBudget,
        categoryBudgets: { ...DEFAULT_CATEGORY_BUDGETS },
      };
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          carryForward: enabled,
        },
      };
    });
  };

  // Recurring Payments
  const addRecurringPayment = (data: Omit<RecurringPayment, 'id'>) => {
    const newItem: RecurringPayment = {
      ...data,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setRecurringPayments((prev) => [...prev, newItem]);
    showToast(`Added recurring payment: ${data.name}`);
  };

  const updateRecurringPayment = (id: string, data: Partial<RecurringPayment>) => {
    setRecurringPayments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    showToast('Recurring payment updated');
  };

  const deleteRecurringPayment = (id: string) => {
    setRecurringPayments((prev) => prev.filter((r) => r.id !== id));
    showToast('Recurring payment removed');
  };

  /**
   * One-click "Record as Paid":
   * Immediately records the transaction in the actual transactions ledger,
   * advances the next due date based on frequency, and notifies the user.
   */
  const recordRecurringPaymentAsPaid = (id: string) => {
    const item = recurringPayments.find((r) => r.id === id);
    if (!item) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Create real transaction
    addTransaction({
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      date: item.nextDueDate || todayStr,
      paymentMethod: item.paymentMethod,
      merchant: item.name,
      notes: `Recurring payment recorded for ${item.name}`,
    });

    // 2. Advance nextDueDate
    const [y, m, d] = (item.nextDueDate || todayStr).split('-').map(Number);
    const dueDate = new Date(y, m - 1, d);

    if (item.frequency === 'weekly') {
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (item.frequency === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else if (item.frequency === 'quarterly') {
      dueDate.setMonth(dueDate.getMonth() + 3);
    } else if (item.frequency === 'yearly') {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    }

    const nextDueDateStr = dueDate.toISOString().split('T')[0];

    // Check if past endDate
    if (item.endDate && nextDueDateStr > item.endDate) {
      deleteRecurringPayment(item.id);
      showToast(`Recorded "${item.name}" as paid. End date reached.`);
    } else {
      updateRecurringPayment(item.id, {
        nextDueDate: nextDueDateStr,
        lastRecordedDate: todayStr,
      });
      showToast(`Recorded "${item.name}" as paid! Next due: ${nextDueDateStr}`);
    }
  };

  // Categories
  const addCategory = (data: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...data,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCategory]);
    showToast(`Added custom category: ${data.name}`);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    showToast('Category updated');
  };

  const deleteCategory = (id: string): boolean => {
    // Check if in use
    const inUse = transactions.some((t) => t.categoryId === id);
    if (inUse) {
      showToast('Cannot delete category: existing transactions use it.', undefined);
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted');
    return true;
  };

  // Settings & System
  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    showToast('Settings saved');
  };

  const resetToDemoData = () => {
    const demo = generateDemoData();
    setTransactions(demo.transactions);
    setCategories(demo.categories);
    setBudgetConfigs(demo.budgetConfigs);
    setRecurringPayments(demo.recurringPayments);
    setSettings(demo.settings);
    showToast('Sample demo data loaded successfully!');
  };

  const clearAllData = () => {
    clearAllAppData();
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgetConfigs({});
    setRecurringPayments([]);
    setSettings({
      ...DEFAULT_SETTINGS,
      hasCompletedOnboarding: false,
    });
    showToast('All data has been cleared.');
  };

  const importData = (backup: AppDataBackup): boolean => {
    try {
      if (!backup || !backup.transactions || !Array.isArray(backup.transactions)) {
        showToast('Invalid backup file format');
        return false;
      }
      setTransactions(backup.transactions);
      if (backup.categories) setCategories(backup.categories);
      if (backup.budgetConfigs) setBudgetConfigs(backup.budgetConfigs);
      if (backup.recurringPayments) setRecurringPayments(backup.recurringPayments);
      if (backup.settings) setSettings(backup.settings);
      showToast('Backup restored successfully!');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Failed to import backup');
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgetConfigs,
        recurringPayments,
        settings,
        activeMonthKey,
        activeMetrics,
        previousMetrics,
        comparison,
        smartInsights,
        toast,
        undoAvailable: !!deletedTxBuffer,

        setActiveMonthKey,
        goToPreviousMonth,
        goToNextMonth,
        goToCurrentMonth,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        undoLastDelete,

        updateOverallBudget,
        updateCategoryBudget,
        setCategoryBudgets,
        toggleCarryForward,

        addRecurringPayment,
        updateRecurringPayment,
        deleteRecurringPayment,
        recordRecurringPaymentAsPaid,

        addCategory,
        updateCategory,
        deleteCategory,

        updateSettings,
        resetToDemoData,
        clearAllData,
        importData,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
