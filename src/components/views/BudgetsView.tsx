/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, parseMonthKey } from '../../utils/calculations';
import { BudgetModal } from '../modals/BudgetModal';
import { ProgressBar } from '../common/ProgressBar';
import {
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Repeat,
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    activeMonthKey,
    activeMetrics,
    budgetConfigs,
    toggleCarryForward,
    settings,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { label: monthLabel } = parseMonthKey(activeMonthKey);
  const currentConfig = budgetConfigs[activeMonthKey];
  const carryForward = currentConfig?.carryForward ?? settings.carryForwardBudgets;

  // Split categories: exceeded, warnings, normal, and unbudgeted
  const exceededCategories = activeMetrics.categorySummaries.filter((c) => c.status === 'exceeded');
  const warningCategories = activeMetrics.categorySummaries.filter((c) => c.status === 'caution' || c.status === 'warning');
  const onTrackCategories = activeMetrics.categorySummaries.filter((c) => c.status === 'normal' && c.budgetLimit > 0);
  const unbudgetedCategories = activeMetrics.categorySummaries.filter((c) => c.budgetLimit === 0 && c.spent > 0);

  const totalAllocated = activeMetrics.categorySummaries.reduce((sum, c) => sum + c.budgetLimit, 0);
  const unallocatedBuffer = activeMetrics.overallBudget - totalAllocated;

  return (
    <div className="space-y-6">
      {/* Title & Adjust Budgets Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Category Budgets & Thresholds
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Allocations and live burn-rate tracking for {monthLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configure Budgets</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Overall Monthly Budget
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {formatCurrency(activeMetrics.overallBudget, settings.currencyCode)}
            </span>
            <p className="text-xs text-neutral-400 mt-1">
              Total monthly limit cap
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Actual Expenses
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {formatCurrency(activeMetrics.totalExpenses, settings.currencyCode)}
            </span>
            <p className="text-xs text-neutral-400 mt-1 tabular-nums">
              {activeMetrics.budgetUtilization.toFixed(1)}% of overall budget
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Remaining Budget
            </span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                activeMetrics.remainingBudget < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrency(activeMetrics.remainingBudget, settings.currencyCode)}
            </span>
            <p className="text-xs text-neutral-400 mt-1">
              {activeMetrics.remainingBudget < 0 ? 'Over limit' : 'Available to spend'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Category Allocation
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {formatCurrency(totalAllocated, settings.currencyCode)}
            </span>
            <p className="text-xs text-neutral-400 mt-1 tabular-nums">
              {unallocatedBuffer >= 0
                ? `${formatCurrency(unallocatedBuffer, settings.currencyCode)} unallocated`
                : `${formatCurrency(Math.abs(unallocatedBuffer), settings.currencyCode)} over-allocated`}
            </p>
          </div>
        </div>

        {/* Global progress */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
          <ProgressBar
            value={activeMetrics.budgetUtilization}
            label="Overall Monthly Utilization"
            sublabel={`${formatCurrency(activeMetrics.totalExpenses, settings.currencyCode)} / ${formatCurrency(activeMetrics.overallBudget, settings.currencyCode)}`}
            showMarkers={true}
          />
        </div>

        {/* Carry Forward Toggle Feature */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Repeat className="w-4 h-4 text-neutral-400" />
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Carry forward unspent budget to next month
              </span>
              <span className="block text-[11px] text-neutral-400">
                When enabled, positive budget remaining adds into next month’s allowances.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleCarryForward(activeMonthKey, !carryForward)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              carryForward
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {carryForward ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Exceeded Categories Warning Banner */}
      {exceededCategories.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-rose-900 dark:text-rose-200">
              {exceededCategories.length} category exceeded its allocated monthly budget
            </h3>
            <p className="text-rose-700 dark:text-rose-300 mt-0.5">
              {exceededCategories.map((c) => `${c.categoryName} (${c.percentageOfBudget.toFixed(0)}% used)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Category Breakdown ({activeMetrics.categorySummaries.length} Categories)
          </h2>
          <span className="text-xs text-neutral-400">
            Threshold warnings: 75% (warning), 90% (caution), 100%+ (exceeded)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMetrics.categorySummaries.map((cat) => {
            const hasLimit = cat.budgetLimit > 0;
            const percentUsed = cat.percentageOfBudget;
            const remaining = cat.remaining;

            return (
              <div
                key={cat.categoryId}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.categoryColor }}
                      />
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {cat.categoryName}
                      </span>
                    </div>

                    {hasLimit ? (
                      <span
                        className={`text-[11px] font-bold tabular-nums ${
                          cat.status === 'exceeded'
                            ? 'text-rose-600 dark:text-rose-400'
                            : cat.status === 'caution'
                            ? 'text-amber-600 dark:text-amber-400'
                            : cat.status === 'warning'
                            ? 'text-amber-500 dark:text-amber-300'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {percentUsed.toFixed(0)}% used
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        No budget set
                      </span>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mb-3 text-xs tabular-nums">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Spent</span>
                      <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(cat.spent, settings.currencyCode)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-neutral-500 block text-[10px]">
                        {hasLimit ? 'Budget Limit' : 'Proportion'}
                      </span>
                      <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {hasLimit
                          ? formatCurrency(cat.budgetLimit, settings.currencyCode)
                          : `${cat.percentageOfTotalExpense.toFixed(1)}% of spend`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {hasLimit ? (
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            cat.status === 'exceeded'
                              ? 'bg-rose-600'
                              : cat.status === 'caution'
                              ? 'bg-amber-600'
                              : cat.status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] tabular-nums pt-0.5">
                        <span className={remaining < 0 ? 'text-rose-600 font-bold' : 'text-neutral-500'}>
                          {remaining < 0
                            ? `Exceeded by ${formatCurrency(Math.abs(remaining), settings.currencyCode)}`
                            : `${formatCurrency(remaining, settings.currencyCode)} remaining`}
                        </span>
                        <span className="text-neutral-400">{cat.percentageOfTotalExpense.toFixed(1)}% of total</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800/50 text-[11px] text-neutral-500 flex items-center justify-between">
                      <span>Untracked category</span>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Set budget
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
