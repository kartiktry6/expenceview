/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Category,
  CategorySpendingSummary,
  MonthlyBudgetConfig,
  MonthMetrics,
  MonthOverMonthComparison,
  RecurringPayment,
  SmartInsight,
  Transaction,
  UserSettings,
} from '../types';
import { CURRENCIES, DEFAULT_SETTINGS } from './constants';

export function getCurrencySymbol(currencyCode: string): string {
  const found = CURRENCIES.find((c) => c.code === currencyCode);
  return found ? found.symbol : '₹';
}

export function formatCurrency(
  amount: number,
  currencyCode = 'INR',
  options: { includeSign?: boolean; showCents?: boolean } = {}
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format numbers nicely with commas
  let formattedNumber = '';
  if (currencyCode === 'INR') {
    // Indian numbering format (e.g., 1,00,000)
    formattedNumber = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: options.showCents ? 2 : 0,
      maximumFractionDigits: options.showCents ? 2 : 0,
    });
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: options.showCents ? 2 : 0,
      maximumFractionDigits: options.showCents ? 2 : 0,
    });
  }

  const sign = isNegative ? '-' : options.includeSign ? '+' : '';
  return `${sign}${symbol}${formattedNumber}`;
}

export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function getMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseMonthKey(monthKey: string): { year: number; month: number; label: string } {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return { year, month, label };
}

export function getPreviousMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getNextMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Filters transactions that belong to a specific monthKey (YYYY-MM).
 */
export function getTransactionsForMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(monthKey));
}

/**
 * Calculates overall financial metrics for a specific month.
 */
export function calculateMonthMetrics(
  transactions: Transaction[],
  monthKey: string,
  categories: Category[],
  budgetConfig?: MonthlyBudgetConfig,
  settings: UserSettings = DEFAULT_SETTINGS
): MonthMetrics {
  const monthTx = getTransactionsForMonth(transactions, monthKey);

  let totalIncome = 0;
  let totalExpenses = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  let largestExpense: Transaction | null = null;

  // Track spending per category
  const categorySpentMap: Record<string, number> = {};

  for (const t of monthTx) {
    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCount++;
    } else {
      totalExpenses += t.amount;
      expenseCount++;
      categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
      if (!largestExpense || t.amount > largestExpense.amount) {
        largestExpense = t;
      }
    }
  }

  const netCashFlow = totalIncome - totalExpenses;
  const overallBudget = budgetConfig?.overallBudget ?? settings.defaultMonthlyBudget;
  const remainingBudget = overallBudget - totalExpenses;

  // Budget utilization: % of budget spent
  const budgetUtilization = overallBudget > 0 ? (totalExpenses / overallBudget) * 100 : 0;

  // Savings rate: % of income saved, guarded when income is <= 0
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  // Category summaries
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const categorySummaries: CategorySpendingSummary[] = expenseCategories.map((cat) => {
    const spent = categorySpentMap[cat.id] || 0;
    const budgetLimit = budgetConfig?.categoryBudgets?.[cat.id] || 0;
    const remaining = budgetLimit > 0 ? budgetLimit - spent : 0;
    const percentageOfTotalExpense = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0;
    const percentageOfBudget = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;

    let status: CategorySpendingSummary['status'] = 'normal';
    if (budgetLimit > 0) {
      if (percentageOfBudget >= 100) {
        status = 'exceeded';
      } else if (percentageOfBudget >= 90) {
        status = 'caution';
      } else if (percentageOfBudget >= 75) {
        status = 'warning';
      }
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      spent,
      budgetLimit,
      remaining,
      percentageOfTotalExpense,
      percentageOfBudget,
      status,
    };
  });

  // Sort by spent descending
  categorySummaries.sort((a, b) => b.spent - a.spent);

  return {
    monthKey,
    totalIncome,
    totalExpenses,
    netCashFlow,
    overallBudget,
    remainingBudget,
    budgetUtilization,
    savingsRate,
    categorySummaries,
    expenseTransactionCount: expenseCount,
    incomeTransactionCount: incomeCount,
    largestExpense,
  };
}

/**
 * Calculates month-over-month differences.
 */
export function calculateMonthOverMonth(
  transactions: Transaction[],
  currentMonthKey: string,
  previousMonthKey: string
): MonthOverMonthComparison {
  const currentTx = getTransactionsForMonth(transactions, currentMonthKey);
  const prevTx = getTransactionsForMonth(transactions, previousMonthKey);

  const currentExpenses = currentTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const previousExpenses = prevTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const currentIncome = currentTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const previousIncome = prevTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const expenseDelta = currentExpenses - previousExpenses;
  const expenseChangePercent = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : null;

  const incomeDelta = currentIncome - previousIncome;
  const incomeChangePercent = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : null;

  return {
    currentExpenses,
    previousExpenses,
    expenseDelta,
    expenseChangePercent,
    currentIncome,
    previousIncome,
    incomeDelta,
    incomeChangePercent,
    currentNetCashFlow: currentIncome - currentExpenses,
    previousNetCashFlow: previousIncome - previousExpenses,
  };
}

/**
 * Daily spending distribution for the active month.
 */
export interface DailySpendingPoint {
  day: number;
  dateStr: string;
  amount: number;
  count: number;
}

export function calculateDailySpending(transactions: Transaction[], monthKey: string): DailySpendingPoint[] {
  const { year, month } = parseMonthKey(monthKey);
  const daysInMonth = getDaysInMonth(year, month);
  const monthTx = getTransactionsForMonth(transactions, monthKey).filter((t) => t.type === 'expense');

  const dailyMap: Record<number, { amount: number; count: number }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = { amount: 0, count: 0 };
  }

  for (const t of monthTx) {
    const day = parseInt(t.date.split('-')[2], 10);
    if (dailyMap[day]) {
      dailyMap[day].amount += t.amount;
      dailyMap[day].count += 1;
    }
  }

  const result: DailySpendingPoint[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthKey}-${String(d).padStart(2, '0')}`;
    result.push({
      day: d,
      dateStr,
      amount: dailyMap[d].amount,
      count: dailyMap[d].count,
    });
  }

  return result;
}

/**
 * Generates transparent, deterministic financial insights based on real user data.
 */
export function generateSmartInsights(
  metrics: MonthMetrics,
  comparison: MonthOverMonthComparison,
  recurringPayments: RecurringPayment[],
  settings: UserSettings
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const symbol = getCurrencySymbol(settings.currencyCode);
  const { year, month } = parseMonthKey(metrics.monthKey);
  const totalDays = getDaysInMonth(year, month);

  // Determine current day of month relative to active month
  const now = new Date();
  const isCurrentCalendarMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;
  const currentDay = isCurrentCalendarMonth ? Math.min(now.getDate(), totalDays) : totalDays;

  // 1. Top category share
  const topCategory = metrics.categorySummaries.find((c) => c.spent > 0);
  if (topCategory && metrics.totalExpenses > 0) {
    const share = topCategory.percentageOfTotalExpense;
    insights.push({
      id: 'top-cat',
      type: share > 40 ? 'warning' : 'info',
      title: `${topCategory.categoryName} is your highest expense`,
      description: `${topCategory.categoryName} accounts for ${share.toFixed(1)}% (${formatCurrency(
        topCategory.spent,
        settings.currencyCode
      )}) of your total spending this month.`,
      calculationNote: `Calculated as: Category spent (${symbol}${topCategory.spent.toLocaleString()}) ÷ Total monthly expenses (${symbol}${metrics.totalExpenses.toLocaleString()}) × 100.`,
      metric: `${share.toFixed(1)}% of spend`,
    });
  }

  // 2. Pace & Projection (if in current calendar month)
  if (isCurrentCalendarMonth && currentDay > 2 && metrics.totalExpenses > 0) {
    const dailyPace = metrics.totalExpenses / currentDay;
    const projectedSpend = Math.round(dailyPace * totalDays);
    const difference = projectedSpend - metrics.overallBudget;

    if (metrics.overallBudget > 0) {
      if (difference > 0) {
        insights.push({
          id: 'spend-pace-warning',
          type: 'alert',
          title: 'Projected budget overrun at current pace',
          description: `At your average spend of ${formatCurrency(
            dailyPace,
            settings.currencyCode
          )}/day over ${currentDay} days, you are projected to reach ${formatCurrency(
            projectedSpend,
            settings.currencyCode
          )} by month-end (exceeding budget by ${formatCurrency(difference, settings.currencyCode)}).`,
          calculationNote: `Pace formula: (Total spent so far ÷ ${currentDay} days) × ${totalDays} days in month = Projected ${symbol}${projectedSpend.toLocaleString()}. Budget is ${symbol}${metrics.overallBudget.toLocaleString()}.`,
          metric: `+${formatCurrency(difference, settings.currencyCode)} projected`,
        });
      } else {
        insights.push({
          id: 'spend-pace-ok',
          type: 'success',
          title: 'Spending is on track with your monthly budget',
          description: `At your average of ${formatCurrency(
            dailyPace,
            settings.currencyCode
          )}/day, your projected month-end spend is ${formatCurrency(
            projectedSpend,
            settings.currencyCode
          )}, staying comfortably within your ${formatCurrency(
            metrics.overallBudget,
            settings.currencyCode
          )} budget.`,
          calculationNote: `Pace formula: (${symbol}${metrics.totalExpenses.toLocaleString()} ÷ ${currentDay} days) × ${totalDays} days = ${symbol}${projectedSpend.toLocaleString()} projected.`,
          metric: `${formatCurrency(Math.abs(difference), settings.currencyCode)} buffer`,
        });
      }
    }
  }

  // 3. Month over Month spending shift
  if (comparison.previousExpenses > 0 && metrics.totalExpenses > 0) {
    const delta = comparison.expenseDelta;
    const pct = comparison.expenseChangePercent;
    if (pct !== null && Math.abs(pct) >= 5) {
      const isMore = delta > 0;
      insights.push({
        id: 'mom-shift',
        type: isMore ? 'warning' : 'success',
        title: isMore
          ? `Spending increased by ${Math.abs(pct).toFixed(1)}% vs last month`
          : `Spending decreased by ${Math.abs(pct).toFixed(1)}% vs last month`,
        description: isMore
          ? `You have spent ${formatCurrency(
              delta,
              settings.currencyCode
            )} more than the same period last month (${formatCurrency(
              comparison.previousExpenses,
              settings.currencyCode
            )}).`
          : `You have saved ${formatCurrency(
              Math.abs(delta),
              settings.currencyCode
            )} compared to last month (${formatCurrency(
              comparison.previousExpenses,
              settings.currencyCode
            )}). Great discipline!`,
        calculationNote: `Formula: (Current expenses - Previous expenses) ÷ Previous expenses × 100 = ((${symbol}${metrics.totalExpenses.toLocaleString()} - ${symbol}${comparison.previousExpenses.toLocaleString()}) ÷ ${symbol}${comparison.previousExpenses.toLocaleString()}) × 100 = ${pct.toFixed(
          1
        )}%.`,
        metric: `${isMore ? '+' : '-'}${Math.abs(pct).toFixed(1)}%`,
      });
    }
  }

  // 4. Over-budget category warnings
  const exceededCategories = metrics.categorySummaries.filter((c) => c.status === 'exceeded');
  if (exceededCategories.length > 0) {
    const names = exceededCategories.map((c) => c.categoryName).join(', ');
    insights.push({
      id: 'budget-exceeded',
      type: 'alert',
      title: `${exceededCategories.length} category exceeded budget`,
      description: `${names} ${
        exceededCategories.length > 1 ? 'have' : 'has'
      } surpassed allocated category limits for ${parseMonthKey(metrics.monthKey).label}.`,
      calculationNote: `Triggered when category actual expenses reach ≥ 100% of defined budget limit.`,
      metric: `${exceededCategories.length} exceeded`,
    });
  }

  // 5. Upcoming recurring commitments
  const upcomingInMonth = recurringPayments.filter((r) => {
    return r.type === 'expense' && r.nextDueDate.startsWith(metrics.monthKey);
  });
  if (upcomingInMonth.length > 0) {
    const totalUpcoming = upcomingInMonth.reduce((s, r) => s + r.amount, 0);
    insights.push({
      id: 'recurring-obligations',
      type: 'info',
      title: `${upcomingInMonth.length} scheduled recurring bills this month`,
      description: `Upcoming scheduled payments total ${formatCurrency(
        totalUpcoming,
        settings.currencyCode
      )} before month-end (not yet deducted until marked paid).`,
      calculationNote: `Sum of ${upcomingInMonth.length} active recurring payment rules scheduled on or before month-end.`,
      metric: formatCurrency(totalUpcoming, settings.currencyCode),
    });
  }

  // 6. Savings rate milestone
  if (metrics.totalIncome > 0) {
    if (metrics.savingsRate >= 30) {
      insights.push({
        id: 'high-savings',
        type: 'success',
        title: `Strong savings rate of ${metrics.savingsRate.toFixed(1)}%`,
        description: `You are retaining ${formatCurrency(
          metrics.netCashFlow,
          settings.currencyCode
        )} of your ${formatCurrency(
          metrics.totalIncome,
          settings.currencyCode
        )} earned income this month.`,
        calculationNote: `Formula: (Total Income - Total Expenses) ÷ Total Income × 100 = ((${symbol}${metrics.totalIncome.toLocaleString()} - ${symbol}${metrics.totalExpenses.toLocaleString()}) ÷ ${symbol}${metrics.totalIncome.toLocaleString()}) × 100 = ${metrics.savingsRate.toFixed(
          1
        )}%.`,
        metric: `${metrics.savingsRate.toFixed(1)}% saved`,
      });
    } else if (metrics.netCashFlow < 0) {
      insights.push({
        id: 'negative-cashflow',
        type: 'alert',
        title: 'Negative monthly cash flow',
        description: `Expenses exceed income by ${formatCurrency(
          Math.abs(metrics.netCashFlow),
          settings.currencyCode
        )} this month. Consider deferring discretionary purchases.`,
        calculationNote: `Calculated as: Total Income (${symbol}${metrics.totalIncome.toLocaleString()}) - Total Expenses (${symbol}${metrics.totalExpenses.toLocaleString()}) = -${symbol}${Math.abs(
          metrics.netCashFlow
        ).toLocaleString()}.`,
        metric: `-${formatCurrency(Math.abs(metrics.netCashFlow), settings.currencyCode)}`,
      });
    }
  }

  return insights;
}
