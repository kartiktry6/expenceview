/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DailySpendingPoint } from '../../utils/calculations';
import { formatCurrency } from '../../utils/calculations';

interface DailySpendChartProps {
  data: DailySpendingPoint[];
  currencyCode: string;
}

export const DailySpendChart: React.FC<DailySpendChartProps> = ({ data, currencyCode }) => {
  const [hoveredPoint, setHoveredPoint] = useState<DailySpendingPoint | null>(null);

  const maxAmount = Math.max(...data.map((d) => d.amount), 100);
  const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);
  const activeDays = data.filter((d) => d.amount > 0).length;
  const avgAmount = activeDays > 0 ? totalAmount / activeDays : 0;

  if (totalAmount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-48 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No daily spending recorded</p>
        <p className="text-xs text-neutral-500 mt-1">Expenses will appear day-by-day across the calendar month.</p>
      </div>
    );
  }

  const chartHeight = 150;
  const avgLineY = chartHeight - (avgAmount / maxAmount) * chartHeight;

  return (
    <div className="space-y-3">
      {/* Chart Header Info */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>Daily Expenses</span>
        {hoveredPoint ? (
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            Day {hoveredPoint.day}: {formatCurrency(hoveredPoint.amount, currencyCode)}{' '}
            <span className="text-neutral-400 font-normal">({hoveredPoint.count} tx)</span>
          </span>
        ) : (
          <span className="tabular-nums">
            Active days avg: <strong className="text-neutral-800 dark:text-neutral-200">{formatCurrency(avgAmount, currencyCode)}/day</strong>
          </span>
        )}
      </div>

      {/* Bar container */}
      <div className="relative pt-4 pb-6">
        {/* Average line */}
        {avgAmount > 0 && avgLineY >= 0 && avgLineY <= chartHeight && (
          <div
            className="absolute left-0 right-0 border-b border-dashed border-neutral-300 dark:border-neutral-700 pointer-events-none z-10"
            style={{ top: `${avgLineY + 16}px` }}
          >
            <span className="absolute right-0 -top-3 text-[10px] text-neutral-400 bg-white/80 dark:bg-neutral-900/80 px-1 rounded tabular-nums">
              avg {formatCurrency(avgAmount, currencyCode)}
            </span>
          </div>
        )}

        <div className="flex items-end justify-between gap-1 h-[150px] w-full">
          {data.map((point) => {
            const heightPercent = point.amount > 0 ? Math.max((point.amount / maxAmount) * 100, 6) : 0;
            const isHovered = hoveredPoint?.day === point.day;
            const isAboveAvg = point.amount > avgAmount && point.amount > 0;

            return (
              <div
                key={point.day}
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Bar */}
                <div className="w-full flex items-end justify-center h-[150px]">
                  <div
                    className={`w-full max-w-[14px] rounded-t-sm transition-all duration-150 ${
                      point.amount === 0
                        ? 'h-1 bg-neutral-100 dark:bg-neutral-800'
                        : isHovered
                        ? 'bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-400/40'
                        : isAboveAvg
                        ? 'bg-rose-500/80 dark:bg-rose-400/80 hover:bg-rose-600'
                        : 'bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
                    }`}
                    style={{ height: point.amount > 0 ? `${heightPercent}%` : '4px' }}
                  />
                </div>

                {/* Day label on x-axis (show for selected steps) */}
                {(point.day === 1 || point.day % 5 === 0 || point.day === data.length) && (
                  <span className="absolute -bottom-5 text-[10px] text-neutral-400 tabular-nums">
                    {point.day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
