/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  parseMonthKey,
  calculateDailySpending,
} from '../../utils/calculations';
import { exportMonthlySummaryToCSV, exportTransactionsToCSV } from '../../utils/storage';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { IncomeExpenseChart } from '../charts/IncomeExpenseChart';
import { DailySpendChart } from '../charts/DailySpendChart';
import { Transaction } from '../../types';
import {
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

type AnalyticsRange = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'all-time';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    activeMonthKey,
    activeMetrics,
    comparison,
    settings,
  } = useFinance();

  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>('this-month');

  // Filter transactions based on date-range
  const rangeTransactions = useMemo(() => {
    if (selectedRange === 'this-month') {
      return transactions.filter((t) => t.date.startsWith(activeMonthKey));
    }
    const { year, month } = parseMonthKey(activeMonthKey);

    if (selectedRange === 'last-month') {
      const prevDate = new Date(year, month - 2, 1);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      return transactions.filter((t) => t.date.startsWith(prevKey));
    }

    if (selectedRange === 'last-3-months') {
      const minDate = new Date(year, month - 3, 1).toISOString().split('T')[0];
      return transactions.filter((t) => t.date >= minDate);
    }

    if (selectedRange === 'last-6-months') {
      const minDate = new Date(year, month - 6, 1).toISOString().split('T')[0];
      return transactions.filter((t) => t.date >= minDate);
    }

    return transactions;
  }, [transactions, selectedRange, activeMonthKey]);

  // Range totals
  const rangeIncome = useMemo(() => {
    return rangeTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [rangeTransactions]);

  const rangeExpenses = useMemo(() => {
    return rangeTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [rangeTransactions]);

  const rangeNet = rangeIncome - rangeExpenses;
  const rangeSavingsRate = rangeIncome > 0 ? Math.max(0, (rangeNet / rangeIncome) * 100) : 0;

  // Top spending categories for this range
  const topCategories = useMemo(() => {
    const catMap: Record<string, { name: string; spent: number }> = {};
    rangeTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!catMap[t.categoryId]) {
          catMap[t.categoryId] = { name: t.categoryName, spent: 0 };
        }
        catMap[t.categoryId].spent += t.amount;
      });

    return Object.values(catMap)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [rangeTransactions]);

  // Top 5 largest transactions
  const largestTransactions = useMemo(() => {
    return [...rangeTransactions]
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [rangeTransactions]);

  const dailySpendData = calculateDailySpending(transactions, activeMonthKey);

  const handleExportSummaryCSV = () => {
    exportMonthlySummaryToCSV(activeMetrics, settings.currencyCode);
  };

  const handleExportRangeTxCSV = () => {
    exportTransactionsToCSV(
      rangeTransactions,
      settings.currencyCode,
      `spendwise_analytics_${selectedRange}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Deep dive into spending velocity, savings habits, and category patterns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date range filter segmented buttons */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedRange('this-month')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedRange === 'this-month'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedRange('last-month')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedRange === 'last-month'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setSelectedRange('last-3-months')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedRange === 'last-3-months'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Last 3M
            </button>
            <button
              onClick={() => setSelectedRange('last-6-months')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedRange === 'last-6-months'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Last 6M
            </button>
            <button
              onClick={() => setSelectedRange('all-time')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedRange === 'all-time'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              All Time
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Summary CSV</span>
            </button>
            <button
              onClick={handleExportRangeTxCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Filtered CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Range KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Range Income
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(rangeIncome, settings.currencyCode)}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            Deposits across selected range
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Range Expenses
          </span>
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(rangeExpenses, settings.currencyCode)}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            Recorded spending transactions
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Net Cash Flow
          </span>
          <span
            className={`text-2xl font-bold tabular-nums ${
              rangeNet >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(rangeNet, settings.currencyCode, { includeSign: true })}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            Income minus expenses
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Savings Rate
          </span>
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {rangeSavingsRate.toFixed(1)}%
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {rangeSavingsRate >= 20 ? 'Optimal savings pace' : 'Below 20% milestone'}
          </p>
        </div>
      </div>

      {/* Historical 6-Month Income vs Expenses Comparison Chart */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-neutral-500" />
              <span>Income vs Expenses (Last 6 Months History)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Compare paired monthly cash inflows against total spending
            </p>
          </div>
        </div>

        <IncomeExpenseChart
          transactions={transactions}
          activeMonthKey={activeMonthKey}
          currencyCode={settings.currencyCode}
        />
      </div>

      {/* 2-Column: Category Donut & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-neutral-500" />
                <span>Selected Month Category Distribution</span>
              </h2>
              <p className="text-xs text-neutral-500">
                Category proportions and actual spending
              </p>
            </div>
          </div>
          <CategoryDonutChart
            categories={activeMetrics.categorySummaries}
            totalExpenses={activeMetrics.totalExpenses}
            currencyCode={settings.currencyCode}
          />
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span>Daily Spending Pace</span>
              </h2>
              <p className="text-xs text-neutral-500">
                Daily expenditure across the month
              </p>
            </div>
          </div>
          <DailySpendChart
            data={dailySpendData}
            currencyCode={settings.currencyCode}
          />
        </div>
      </div>

      {/* 2-Column: Top Spending Categories & Largest Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Categories */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Spending Categories in Selected Range</span>
          </h2>
          {topCategories.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No expenses in this date range.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((c, i) => {
                const pct = rangeExpenses > 0 ? (c.spent / rangeExpenses) * 100 : 0;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {i + 1}. {c.name}
                      </span>
                      <span className="tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(c.spent, settings.currencyCode)}{' '}
                        <span className="text-neutral-400 font-normal">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Largest Transactions */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>Largest Single Expenses in Selected Range</span>
          </h2>
          {largestTransactions.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No transactions in this date range.</p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {largestTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block truncate max-w-xs">
                      {tx.merchant}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {tx.categoryName} · {tx.date}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(tx.amount, settings.currencyCode)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
