/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: {
    text: string;
    isPositive: boolean; // positive in financial context (green) or negative (red)
    neutral?: boolean;
  };
  indicator?: 'default' | 'positive' | 'warning' | 'negative';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  delta,
  indicator = 'default',
  icon,
}) => {
  const getIndicatorColor = () => {
    switch (indicator) {
      case 'positive':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-700 dark:text-amber-400';
      case 'negative':
        return 'text-rose-700 dark:text-rose-400';
      default:
        return 'text-neutral-900 dark:text-neutral-100';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 transition-shadow hover:shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="text-neutral-400 dark:text-neutral-500">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${getIndicatorColor()}`}>
          {value}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta && (
          <span
            className={`font-semibold tabular-nums ${
              delta.neutral
                ? 'text-neutral-500'
                : delta.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {delta.text}
          </span>
        )}
        {subtitle && (
          <span className="text-neutral-500 dark:text-neutral-400 truncate">
            {delta && <span className="mr-1.5 opacity-60">·</span>}
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
