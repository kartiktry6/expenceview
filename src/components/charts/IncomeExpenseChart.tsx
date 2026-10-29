/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatCurrency, getMonthKey, parseMonthKey } from '../../utils/calculations';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  activeMonthKey: string;
  currencyCode: string;
}

interface MonthlyBarData {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  transactions,
  activeMonthKey,
  currencyCode,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyBarData | null>(null);

  // Generate 6 months ending at activeMonthKey
  const { year, month } = parseMonthKey(activeMonthKey);
  const monthsData: MonthlyBarData[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const mKey = getMonthKey(d);
    const label = d.toLocaleDateString('en-US', { month: 'short' });

    const monthTx = transactions.filter((t) => t.date.startsWith(mKey));
    const income = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expenses;

    monthsData.push({
      monthKey: mKey,
      label,
      income,
      expenses,
      net,
    });
  }

  const maxVal = Math.max(
    ...monthsData.map((m) => Math.max(m.income, m.expenses)),
    1000
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 dark:bg-neutral-600" />
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">Expenses</span>
          </div>
        </div>

        {hoveredMonth && (
          <div className="text-right tabular-nums">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {hoveredMonth.label}:
            </span>{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(hoveredMonth.income, currencyCode)}
            </span>{' '}
            / <span className="text-neutral-500">{formatCurrency(hoveredMonth.expenses, currencyCode)}</span>{' '}
            <span
              className={
                hoveredMonth.net >= 0
                  ? 'text-emerald-600 font-semibold'
                  : 'text-rose-500 font-semibold'
              }
            >
              (Net {formatCurrency(hoveredMonth.net, currencyCode, { includeSign: true })})
            </span>
          </div>
        )}
      </div>

      {/* Chart grid */}
      <div className="h-52 flex items-end justify-between gap-4 pt-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        {monthsData.map((item) => {
          const incomeHeight = item.income > 0 ? Math.max((item.income / maxVal) * 100, 4) : 0;
          const expenseHeight = item.expenses > 0 ? Math.max((item.expenses / maxVal) * 100, 4) : 0;
          const isActive = item.monthKey === activeMonthKey;

          return (
            <div
              key={item.monthKey}
              className={`flex-1 flex flex-col items-center h-full justify-end cursor-pointer group p-1 rounded-md transition-colors ${
                isActive ? 'bg-neutral-100/60 dark:bg-neutral-800/40' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/20'
              }`}
              onMouseEnter={() => setHoveredMonth(item)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Paired Bars */}
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                {/* Income Bar */}
                <div
                  className="w-full max-w-[16px] bg-emerald-600 dark:bg-emerald-500 rounded-t-sm transition-all duration-200 hover:brightness-110"
                  style={{ height: `${incomeHeight}%` }}
                />
                {/* Expense Bar */}
                <div
                  className="w-full max-w-[16px] bg-neutral-400 dark:bg-neutral-600 rounded-t-sm transition-all duration-200 hover:brightness-110"
                  style={{ height: `${expenseHeight}%` }}
                />
              </div>

              {/* Month label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs block ${
                    isActive
                      ? 'font-bold text-neutral-900 dark:text-neutral-100 underline decoration-blue-500 decoration-2 underline-offset-4'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
