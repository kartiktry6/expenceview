/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, Transaction, TransactionType } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { PAYMENT_METHODS } from '../../utils/constants';
import { exportTransactionsToCSV } from '../../utils/storage';
import { TransactionModal } from '../modals/TransactionModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Search,
  Download,
  Plus,
  ArrowUpDown,
  Filter,
  X,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
}

type SortField = 'date' | 'amount' | 'merchant';
type SortOrder = 'asc' | 'desc';

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddTransaction,
}) => {
  const { transactions, categories, deleteTransaction, settings, activeMonthKey } = useFinance();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [monthScope, setMonthScope] = useState<'current-month' | 'all-time'>('current-month');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Month scope
      if (monthScope === 'current-month' && !t.date.startsWith(activeMonthKey)) {
        return false;
      }
      // Type
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }
      // Category
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
        return false;
      }
      // Payment Method
      if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesMerchant = t.merchant.toLowerCase().includes(query);
        const matchesCategory = t.categoryName.toLowerCase().includes(query);
        const matchesNotes = t.notes ? t.notes.toLowerCase().includes(query) : false;
        if (!matchesMerchant && !matchesCategory && !matchesNotes) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'merchant') {
        comparison = a.merchant.localeCompare(b.merchant);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [
    transactions,
    monthScope,
    activeMonthKey,
    selectedType,
    selectedCategory,
    selectedPaymentMethod,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  // Aggregate stats for filtered records
  const filteredStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense,
    };
  }, [filteredTransactions]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const filename = `spendwise_transactions_${monthScope === 'current-month' ? activeMonthKey : 'all'}.csv`;
    exportTransactionsToCSV(filteredTransactions, settings.currencyCode, filename);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    setMonthScope('current-month');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPaymentMethod !== 'all' ||
    monthScope !== 'current-month';

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Transactions Ledger
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Search, filter, categorize, and audit your financial records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, category, or notes..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Month Scope Toggle (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={monthScope}
              onChange={(e) => setMonthScope(e.target.value as 'current-month' | 'all-time')}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            >
              <option value="current-month">Selected Month</option>
              <option value="all-time">All Time</option>
            </select>
          </div>

          {/* Type Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Payment method filter and reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Method:</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedPaymentMethod === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                All
              </button>
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(pm)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedPaymentMethod === pm
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Filter className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filtered Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
        <div>
          <span className="text-neutral-500 block">Total Filtered</span>
          <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {filteredStats.count} entries
          </span>
        </div>
        <div>
          <span className="text-neutral-500 block">Filtered Expenses</span>
          <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(filteredStats.expense, settings.currencyCode)}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 block">Filtered Income</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(filteredStats.income, settings.currencyCode)}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 block">Net Difference</span>
          <span
            className={`font-bold tabular-nums ${
              filteredStats.net >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(filteredStats.net, settings.currencyCode, { includeSign: true })}
          </span>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              No transactions match your current filters.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search terms or clearing category filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-semibold select-none">
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('merchant')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Merchant / Description</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/60 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Merchant */}
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="truncate max-w-xs">{tx.merchant}</span>
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] font-normal text-neutral-400 dark:text-neutral-500 truncate max-w-xs pl-4 mt-0.5">
                            {tx.notes}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                        {tx.categoryName}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }
                        >
                          {isIncome && <ArrowDownLeft className="w-3.5 h-3.5 inline" />}
                          {!isIncome && <ArrowUpRight className="w-3.5 h-3.5 inline text-neutral-400" />}
                          {formatCurrency(tx.amount, settings.currencyCode, { includeSign: isIncome })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={!!editingTx}
        transactionToEdit={editingTx}
        onClose={() => setEditingTx(null)}
      />

      <ConfirmationModal
        isOpen={!!deletingTxId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? An undo notification will allow you to revert this immediately."
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
