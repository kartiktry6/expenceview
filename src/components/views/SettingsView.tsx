/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCIES } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/calculations';
import { exportDataAsJSON, AppDataBackup } from '../../utils/storage';
import { CategoryModal } from '../modals/CategoryModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Globe,
  Sliders,
  Moon,
  Sun,
  Tags,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Plus,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    deleteCategory,
    transactions,
    budgetConfigs,
    recurringPayments,
    resetToDemoData,
    clearAllData,
    importData,
    showToast,
  } = useFinance();

  const [currency, setCurrency] = useState(settings.currencyCode);
  const [defaultBudget, setDefaultBudget] = useState(settings.defaultMonthlyBudget.toString());
  const [defaultIncome, setDefaultIncome] = useState(settings.defaultMonthlyIncomeTarget.toString());
  const [theme, setTheme] = useState(settings.theme);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isResetDemoModalOpen, setIsResetDemoModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSymbol = getCurrencySymbol(currency);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(defaultBudget) || 45000;
    const incomeNum = parseFloat(defaultIncome) || 70000;

    updateSettings({
      currencyCode: currency,
      defaultMonthlyBudget: budgetNum,
      defaultMonthlyIncomeTarget: incomeNum,
      theme,
    });
  };

  const handleExportJSON = () => {
    const backup: AppDataBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      budgetConfigs,
      recurringPayments,
      settings,
    };
    exportDataAsJSON(backup);
    showToast('Exported SpendWise backup file');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importData(parsed);
      } catch (err) {
        showToast('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Preferences & Data Management
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Currency, default budgeting benchmarks, category setup, and local storage backups
        </p>
      </div>

      {/* Storage Transparency Notice */}
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
          <strong className="block font-semibold">100% Local & Private Storage:</strong>
          SpendWise stores all transactions, categories, and budgets entirely within your device’s local browser storage. No financial accounts, bank logins, or data telemetry are ever synchronized to external servers. You can export complete backups anytime.
        </div>
      </div>

      {/* General Configuration Form */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-neutral-500" />
          <span>Regional & Financial Defaults</span>
        </h2>

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Theme Interface
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-1.5 px-3 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    theme === 'light'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-1.5 px-3 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    theme === 'dark'
                      ? 'bg-neutral-700 text-neutral-100 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" /> Dark
                </button>
              </div>
            </div>

            {/* Default Monthly Budget */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Default Monthly Budget Target
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 tabular-nums">
                  {currentSymbol}
                </span>
                <input
                  type="number"
                  value={defaultBudget}
                  onChange={(e) => setDefaultBudget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-semibold tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Default Income Target */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Monthly Income Benchmark
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 tabular-nums">
                  {currentSymbol}
                </span>
                <input
                  type="number"
                  value={defaultIncome}
                  onChange={(e) => setDefaultIncome(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-semibold tabular-nums bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 shadow-xs cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Category Manager */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Tags className="w-4 h-4 text-neutral-500" />
              <span>Category Manager ({categories.length} total)</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Customize expense and income classification labels
            </p>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Category</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex items-center justify-between gap-2 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {cat.name}
                </span>
              </div>

              {cat.isCustom && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-neutral-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity p-0.5"
                  title="Delete custom category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup & System Data Actions */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Data Backup & Reset
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-neutral-500" />
                <span>Export Full JSON Backup</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Save an unencrypted snapshot of your complete transactions, recurring items, and custom budgets.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-center"
            >
              Download JSON File
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-neutral-500" />
                <span>Restore JSON Backup</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Restore previously exported SpendWise data from your local file storage.
              </p>
            </div>
            <label className="px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-center block">
              Choose File
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone Actions */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsResetDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset with Realistic Demo Data</span>
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isResetDemoModalOpen}
        title="Load Sample Demo Data"
        message="This will overwrite current records with balanced sample transactions across current and previous month, categories, budgets, and recurring subscriptions. Proceed?"
        confirmLabel="Load Demo Data"
        onConfirm={() => {
          resetToDemoData();
          setIsResetDemoModalOpen(false);
        }}
        onCancel={() => setIsResetDemoModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Clear All SpendWise Data"
        message="Are you completely sure? This will permanently wipe all local transactions, recurring rules, and custom budgets. This action cannot be undone unless you have a JSON backup."
        confirmLabel="Wipe Everything"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
