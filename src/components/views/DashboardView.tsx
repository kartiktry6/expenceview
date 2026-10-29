/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  parseMonthKey,
  calculateDailySpending,
} from '../../utils/calculations';
import { MetricCard } from '../common/MetricCard';
import { ProgressBar } from '../common/ProgressBar';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { DailySpendChart } from '../charts/DailySpendChart';
import { BudgetModal } from '../modals/BudgetModal';
import { TransactionModal } from '../modals/TransactionModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { NavTab } from '../layout/Sidebar';
import { Transaction } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  PiggyBank,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAddTransaction,
}) => {
  const {
    transactions,
    activeMonthKey,
    activeMetrics,
    comparison,
    smartInsights,
    recurringPayments,
    recordRecurringPaymentAsPaid,
    deleteTransaction,
    settings,
  } = useFinance();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  const { label: monthLabel } = parseMonthKey(activeMonthKey);
  const dailySpendData = calculateDailySpending(transactions, activeMonthKey);

  // Month's recent transactions (sorted newest first)
  const monthTransactions = transactions
    .filter((t) => t.date.startsWith(activeMonthKey))
    .slice(0, 5);

  // Upcoming recurring expenses due this month
  const upcomingRecurring = recurringPayments
    .filter((r) => r.type === 'expense' && r.nextDueDate.startsWith(activeMonthKey))
    .slice(0, 4);

  // All-time Cumulative Account Net Balance
  const totalAllTimeIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAllTimeExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const cumulativeAccountBalance = totalAllTimeIncome - totalAllTimeExpenses;

  // Formatting MoM indicators
  const expenseMoMText =
    comparison.expenseChangePercent !== null
      ? `${comparison.expenseChangePercent >= 0 ? '+' : ''}${comparison.expenseChangePercent.toFixed(1)}% vs last month`
      : 'First recorded month';

  const incomeMoMText =
    comparison.incomeChangePercent !== null
      ? `${comparison.incomeChangePercent >= 0 ? '+' : ''}${comparison.incomeChangePercent.toFixed(1)}% vs last month`
      : 'First recorded month';

  return (
    <div className="space-y-6">
      {/* Header Banner & Context distinction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {monthLabel} Overview
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time monthly ledger, category pacing, and cash flow balance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>Adjust Budgets</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* 5-Card Core Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(activeMetrics.totalIncome, settings.currencyCode)}
          subtitle={`${activeMetrics.incomeTransactionCount} deposits this month`}
          delta={{
            text: incomeMoMText,
            isPositive: (comparison.incomeChangePercent ?? 0) >= 0,
            neutral: comparison.incomeChangePercent === null,
          }}
          indicator="positive"
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        />

        {/* Total Expenses */}
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(activeMetrics.totalExpenses, settings.currencyCode)}
          subtitle={`${activeMetrics.expenseTransactionCount} transactions logged`}
          delta={{
            text: expenseMoMText,
            // for expenses, lower spend is positive (green)
            isPositive: (comparison.expenseChangePercent ?? 0) <= 0,
            neutral: comparison.expenseChangePercent === null,
          }}
          indicator="default"
          icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
        />

        {/* Remaining Monthly Budget */}
        <MetricCard
          title="Remaining Budget"
          value={formatCurrency(activeMetrics.remainingBudget, settings.currencyCode)}
          subtitle={`Limit: ${formatCurrency(activeMetrics.overallBudget, settings.currencyCode)}`}
          delta={{
            text: `${activeMetrics.budgetUtilization.toFixed(0)}% used`,
            isPositive: activeMetrics.budgetUtilization <= 90,
            neutral: false,
          }}
          indicator={
            activeMetrics.remainingBudget < 0
              ? 'negative'
              : activeMetrics.budgetUtilization >= 90
              ? 'warning'
              : 'positive'
          }
          icon={<Scale className="w-4 h-4 text-blue-500" />}
        />

        {/* Monthly Net Cash Flow */}
        <MetricCard
          title="Net Cash Flow"
          value={formatCurrency(activeMetrics.netCashFlow, settings.currencyCode, { includeSign: true })}
          subtitle="Income minus expenses"
          delta={{
            text:
              comparison.previousNetCashFlow !== 0
                ? `${activeMetrics.netCashFlow >= comparison.previousNetCashFlow ? '+' : ''}${formatCurrency(
                    activeMetrics.netCashFlow - comparison.previousNetCashFlow,
                    settings.currencyCode
                  )} vs last month`
                : 'Selected month',
            isPositive: activeMetrics.netCashFlow >= 0,
            neutral: false,
          }}
          indicator={activeMetrics.netCashFlow >= 0 ? 'positive' : 'negative'}
          icon={<PiggyBank className="w-4 h-4 text-purple-500" />}
        />

        {/* Savings Rate & Actual Balance */}
        <MetricCard
          title="Savings Rate"
          value={`${activeMetrics.savingsRate.toFixed(1)}%`}
          subtitle={`Account Balance: ${formatCurrency(cumulativeAccountBalance, settings.currencyCode)}`}
          delta={{
            text:
              activeMetrics.savingsRate >= 20
                ? 'Target healthy (≥20%)'
                : activeMetrics.totalIncome === 0
                ? 'No income logged'
                : 'Below 20% target',
            isPositive: activeMetrics.savingsRate >= 20,
            neutral: activeMetrics.totalIncome === 0,
          }}
          indicator={activeMetrics.savingsRate >= 20 ? 'positive' : 'warning'}
          icon={<CheckCircle2 className="w-4 h-4 text-teal-500" />}
        />
      </div>

      {/* Budget Utilization Progress Bar Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Monthly Budget Utilization
            </h2>
            <p className="text-xs text-neutral-500">
              {formatCurrency(activeMetrics.totalExpenses, settings.currencyCode)} spent of{' '}
              {formatCurrency(activeMetrics.overallBudget, settings.currencyCode)} total budget
            </p>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-bold tabular-nums ${
                activeMetrics.budgetUtilization >= 100
                  ? 'text-rose-600 dark:text-rose-400'
                  : activeMetrics.budgetUtilization >= 75
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {activeMetrics.budgetUtilization.toFixed(1)}% Utilized
            </span>
          </div>
        </div>

        <ProgressBar
          value={activeMetrics.budgetUtilization}
          showMarkers={true}
        />
      </div>

      {/* 2-Column Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Donut Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Spending by Category
              </h2>
              <p className="text-xs text-neutral-500">
                Hover over slices to inspect proportion & totals
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage Limits <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <CategoryDonutChart
            categories={activeMetrics.categorySummaries}
            totalExpenses={activeMetrics.totalExpenses}
            currencyCode={settings.currencyCode}
          />
        </div>

        {/* Daily Spending Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Daily Spending Pace
              </h2>
              <p className="text-xs text-neutral-500">
                Day-by-day distribution across {monthLabel}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Trends <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <DailySpendChart
            data={dailySpendData}
            currencyCode={settings.currencyCode}
          />
        </div>
      </div>

      {/* Smart Insights Strip */}
      {smartInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Financial Insights & Pace Projections</span>
            </h2>
            <span className="text-xs text-neutral-400">
              Deterministic calculations based on your ledger
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartInsights.slice(0, 3).map((insight) => {
              const isExpanded = expandedInsightId === insight.id;
              return (
                <div
                  key={insight.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                        {insight.title}
                      </h3>
                      {insight.metric && (
                        <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 tabular-nums shrink-0">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                      className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3 h-3 text-neutral-400" />
                      <span>{isExpanded ? 'Hide formula' : 'How this was calculated'}</span>
                    </button>
                    {isExpanded && (
                      <p className="mt-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-850 p-2 rounded-md leading-relaxed">
                        {insight.calculationNote}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-Column: Recent Transactions & Upcoming Recurring Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Recent Transactions
              </h2>
              <p className="text-xs text-neutral-500">
                Latest records for {monthLabel}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All ({activeMetrics.expenseTransactionCount + activeMetrics.incomeTransactionCount}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {monthTransactions.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">No transactions recorded for this month.</p>
              <button
                onClick={onOpenAddTransaction}
                className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Record your first transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {monthTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {tx.merchant}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{tx.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, settings.currencyCode)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-[10px] font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingTxId(tx.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 text-[10px] font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Recurring Reminders (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>Upcoming Recurring Bills</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Scheduled obligations due in {monthLabel}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('recurring')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingRecurring.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500">No scheduled bills due this month.</p>
                <button
                  onClick={() => onNavigateTab('recurring')}
                  className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Set up recurring schedules
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRecurring.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                        <span>Due {item.nextDueDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.frequency}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(item.amount, settings.currencyCode)}
                      </span>
                      <button
                        onClick={() => recordRecurringPaymentAsPaid(item.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-md transition-colors cursor-pointer shadow-2xs"
                        title="Record as actual transaction and roll due date forward"
                      >
                        Record Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Note: Scheduled items do not count against budget until paid.</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <TransactionModal
        isOpen={!!editingTx}
        transactionToEdit={editingTx}
        onClose={() => setEditingTx(null)}
      />

      <ConfirmationModal
        isOpen={!!deletingTxId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? You can restore it immediately using the undo notification."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingTxId) deleteTransaction(deletingTxId);
          setDeletingTxId(null);
        }}
        onCancel={() => setDeletingTxId(null)}
      />
    </div>
  );
};
