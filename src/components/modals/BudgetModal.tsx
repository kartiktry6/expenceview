/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { getCurrencySymbol, parseMonthKey } from '../../utils/calculations';
import { X } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const {
    activeMonthKey,
    categories,
    budgetConfigs,
    settings,
    updateOverallBudget,
    setCategoryBudgets,
  } = useFinance();

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const currencySymbol = getCurrencySymbol(settings.currencyCode);
  const currentConfig = budgetConfigs[activeMonthKey];

  const [overallBudget, setOverallBudget] = useState('');
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const currentOverall = currentConfig?.overallBudget ?? settings.defaultMonthlyBudget;
      setOverallBudget(currentOverall.toString());

      const currentCats = currentConfig?.categoryBudgets || {};
      const initialLimits: Record<string, string> = {};
      expenseCategories.forEach((cat) => {
        initialLimits[cat.id] = (currentCats[cat.id] || 0).toString();
      });
      setCategoryLimits(initialLimits);
    }
  }, [isOpen, activeMonthKey, currentConfig, settings.defaultMonthlyBudget]);

  if (!isOpen) return null;

  const totalAllocated = Object.values(categoryLimits).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const parsedOverall = parseFloat(overallBudget) || 0;
  const difference = parsedOverall - totalAllocated;

  const handleLimitChange = (catId: string, val: string) => {
    setCategoryLimits((prev) => ({ ...prev, [catId]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOverall = parseFloat(overallBudget);
    updateOverallBudget(activeMonthKey, isNaN(finalOverall) ? 0 : finalOverall);

    const numericBudgets: Record<string, number> = {};
    Object.entries(categoryLimits).forEach(([catId, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        numericBudgets[catId] = num;
      }
    });

    setCategoryBudgets(activeMonthKey, numericBudgets);
    onClose();
  };

  const monthLabel = parseMonthKey(activeMonthKey).label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Manage Monthly Budgets
            </h3>
            <p className="text-xs text-neutral-500">{monthLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Overall Monthly Budget */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Overall Total Spending Budget *
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400 tabular-nums">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                value={overallBudget}
                onChange={(e) => setOverallBudget(e.target.value)}
                placeholder="50000"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold tabular-nums bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>Allocated across categories: <strong className="text-neutral-800 dark:text-neutral-200 tabular-nums">{currencySymbol}{totalAllocated.toLocaleString()}</strong></span>
              <span className={difference < 0 ? 'text-rose-500 font-semibold tabular-nums' : 'text-neutral-500 tabular-nums'}>
                {difference >= 0 ? `Unallocated buffer: ${currencySymbol}${difference.toLocaleString()}` : `Exceeds overall budget by ${currencySymbol}${Math.abs(difference).toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Category Budgets Grid */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Category Limits
            </label>
            <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
              {expenseCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-850 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="relative w-36 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 tabular-nums">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={categoryLimits[cat.id] ?? ''}
                      onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-medium tabular-nums bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Save Budgets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
