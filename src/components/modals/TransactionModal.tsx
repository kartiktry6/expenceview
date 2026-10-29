/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, Transaction, TransactionType } from '../../types';
import { PAYMENT_METHODS } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/calculations';
import { CategoryModal } from './CategoryModal';
import { Plus, X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { categories, settings, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const currencySymbol = getCurrencySymbol(settings.currencyCode);

  // Initialize or populate form
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategoryId(transactionToEdit.categoryId);
      setDate(transactionToEdit.date);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setMerchant(transactionToEdit.merchant);
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setMerchant('');
      setNotes('');
      // Set first matching category
      const firstExp = categories.find((c) => c.type === 'expense');
      if (firstExp) setCategoryId(firstExp.id);
    }
    setErrors({});
  }, [transactionToEdit, isOpen, categories]);

  // When type changes, ensure category matches type
  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!transactionToEdit) {
      const match = categories.find((c) => c.type === type);
      if (match) setCategoryId(match.id);
    }
  }, [type, categories, transactionToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than zero.';
    }
    if (!merchant.trim()) {
      errs.merchant = 'Merchant or description is required.';
    }
    if (!categoryId) {
      errs.categoryId = 'Please select a category.';
    }
    if (!date) {
      errs.date = 'Date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : 'Other';

    const payload = {
      type,
      amount: parseFloat(amount),
      categoryId,
      categoryName,
      date,
      paymentMethod,
      merchant: merchant.trim(),
      notes: notes.trim() || undefined,
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div
          className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type selector (Segmented control) */}
            <div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    type === 'expense'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    type === 'income'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Amount & Date in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400 tabular-nums">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                    }}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold tabular-nums bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
                    autoFocus={!transactionToEdit}
                  />
                </div>
                {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
                />
                {errors.date && <p className="text-[11px] text-rose-500 mt-1">{errors.date}</p>}
              </div>
            </div>

            {/* Merchant / Description */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Merchant / Description *
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  if (errors.merchant) setErrors((prev) => ({ ...prev, merchant: '' }));
                }}
                placeholder={type === 'expense' ? 'e.g. Swiggy, Uber, Zara, Amazon' : 'e.g. Monthly Salary, Freelance Client'}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              />
              {errors.merchant && <p className="text-[11px] text-rose-500 mt-1">{errors.merchant}</p>}
            </div>

            {/* Category with Add Custom Category action */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New Category
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
                }}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 cursor-pointer"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-[11px] text-rose-500 mt-1">{errors.categoryId}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border text-center transition-colors truncate cursor-pointer ${
                      paymentMethod === pm
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Optional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional details, invoice number, items purchased..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                {transactionToEdit ? 'Save Changes' : 'Record Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        initialType={type}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
};
