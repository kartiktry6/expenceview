/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useFinance();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between gap-3 p-4 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xl shadow-lg border border-neutral-800 dark:border-neutral-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs font-medium truncate">{toast.message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                dismissToast();
              }}
              className="text-xs font-bold text-emerald-400 dark:text-emerald-700 hover:underline px-1 cursor-pointer"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={dismissToast}
            className="p-1 hover:opacity-75 transition-opacity text-neutral-400 hover:text-white dark:hover:text-neutral-900 cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
