/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCIES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/calculations';
import { Compass, Sparkles, Plus, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onOpenAddTransaction: () => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onOpenAddTransaction,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    activeMonthKey,
    updateOverallBudget,
  } = useFinance();

  const [step, setStep] = useState<1 | 2>(1);
  const [currency, setCurrency] = useState(settings.currencyCode);
  const [monthlyBudget, setMonthlyBudget] = useState(settings.defaultMonthlyBudget.toString());
  const [monthlyIncome, setMonthlyIncome] = useState(settings.defaultMonthlyIncomeTarget.toString());

  if (!isOpen) return null;

  const currentSymbol = getCurrencySymbol(currency);

  const handleCompleteSetup = () => {
    const budgetVal = parseFloat(monthlyBudget) || 45000;
    const incomeVal = parseFloat(monthlyIncome) || 70000;

    updateSettings({
      currencyCode: currency,
      defaultMonthlyBudget: budgetVal,
      defaultMonthlyIncomeTarget: incomeVal,
      hasCompletedOnboarding: true,
    });
    updateOverallBudget(activeMonthKey, budgetVal);
    onClose();
  };

  const handleLoadDemo = () => {
    resetToDemoData();
    onClose();
  };

  const handleStartWithFirstTx = () => {
    handleCompleteSetup();
    onOpenAddTransaction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Welcome to SpendWise
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Take control of your monthly spending and savings targets
              </p>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-5 mt-6">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                SpendWise keeps all your financial records private and stored directly in your local browser storage. Let’s configure your preferred currency and baseline targets.
              </p>

              {/* Currency Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Targets in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Monthly Expense Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 tabular-nums">
                      {currentSymbol}
                    </span>
                    <input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="45000"
                      className="w-full pl-7 pr-3 py-2 text-xs font-semibold tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Expected Monthly Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 tabular-nums">
                      {currentSymbol}
                    </span>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="70000"
                      className="w-full pl-7 pr-3 py-2 text-xs font-semibold tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Load sample demo data
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                You’re all set up! How would you like to start?
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleStartWithFirstTx}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Add My First Transaction
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Record an expense or paycheck manually from a clean slate.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-850/60 transition-all text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Explore with Realistic Demo Data
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Populates sample groceries, bills, salary, and charts to try all features.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSetup}
                  className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline cursor-pointer"
                >
                  Skip to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
