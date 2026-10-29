/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100+
  label?: string;
  sublabel?: string;
  showMarkers?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  showMarkers = true,
}) => {
  const clampedWidth = Math.min(Math.max(value, 0), 100);

  // Status color based on budget thresholds
  let barColor = 'bg-emerald-600 dark:bg-emerald-500';
  let textColor = 'text-emerald-700 dark:text-emerald-400';

  if (value >= 100) {
    barColor = 'bg-rose-600 dark:bg-rose-500';
    textColor = 'text-rose-700 dark:text-rose-400';
  } else if (value >= 90) {
    barColor = 'bg-amber-600 dark:bg-amber-500';
    textColor = 'text-amber-700 dark:text-amber-400';
  } else if (value >= 75) {
    barColor = 'bg-amber-500 dark:bg-amber-400';
    textColor = 'text-amber-600 dark:text-amber-300';
  }

  return (
    <div className="space-y-1.5 w-full">
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>}
          {sublabel && (
            <span className={`font-semibold tabular-nums ${textColor}`}>
              {sublabel}
            </span>
          )}
        </div>
      )}

      <div className="relative h-2.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${clampedWidth}%` }}
        />

        {/* Milestone ticks */}
        {showMarkers && (
          <>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-neutral-300 dark:bg-neutral-600 z-10 pointer-events-none opacity-60"
              style={{ left: '75%' }}
              title="75% threshold"
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-neutral-300 dark:bg-neutral-600 z-10 pointer-events-none opacity-60"
              style={{ left: '90%' }}
              title="90% threshold"
            />
          </>
        )}
      </div>

      {showMarkers && (
        <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500 px-0.5 tabular-nums">
          <span>0%</span>
          <span className="translate-x-1">75%</span>
          <span>90%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};
