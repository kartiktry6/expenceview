/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CategorySpendingSummary } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface CategoryDonutChartProps {
  categories: CategorySpendingSummary[];
  totalExpenses: number;
  currencyCode: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalExpenses,
  currencyCode,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeCategories = categories.filter((c) => c.spent > 0);

  if (activeCategories.length === 0 || totalExpenses === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-64 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No expenses recorded yet</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Add your first expense transaction to see category breakdown.</p>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = activeCategories.map((cat, idx) => {
    const percent = cat.spent / totalExpenses;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      category: cat,
      idx,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCat = hoveredIndex !== null ? activeCategories[hoveredIndex] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 transition-all duration-300"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-neutral-100 dark:text-neutral-800"
          />

          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.idx;
            return (
              <circle
                key={slice.category.categoryId}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.category.categoryColor || '#64748B'}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer origin-center"
                style={{
                  opacity: hoveredIndex === null || isHovered ? 1 : 0.45,
                  filter: isHovered ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(slice.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {activeCat ? (
            <>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate max-w-[130px]">
                {activeCat.categoryName}
              </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {formatCurrency(activeCat.spent, currencyCode)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeCat.percentageOfTotalExpense.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Total Spend
              </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {formatCurrency(totalExpenses, currencyCode)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeCategories.length} Categories
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {activeCategories.map((cat, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <div
              key={cat.categoryId}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                isHovered
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.categoryColor || '#94A3B8' }}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {cat.categoryName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(cat.spent, currencyCode)}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500 w-10 text-right">
                  {cat.percentageOfTotalExpense.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
