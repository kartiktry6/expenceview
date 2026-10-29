/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, RecurringFrequency, RecurringPayment, TransactionType } from '../../types';
import { PAYMENT_METHODS } from '../../utils/constants';
import { getCurrencySymbol } from '../../utils/calculations';
import { X } from 'lucide-react';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: RecurringPayment | null;
}

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (3 Months)' },
  { value: 'yearly', label: 'Yearly' },
];

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { categories, settings, addRecurringPayment, updateRecurringPayment } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencySymbol = getCurrencySymbol(settings.currencyCode);

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setName(itemToEdit.name);
      setAmount(itemToEdit.amount.toString());
      setCategoryId(itemToEdit.categoryId);
      setPaymentMethod(itemToEdit.paymentMethod);
      setFrequency(itemToEdit.frequency);
      setNextDueDate(itemToEdit.nextDueDate);
      setEndDate(itemToEdit.endDate || '');
      setNotes(itemToEdit.notes || '');
    } else {
      setType('expense');
      setName('');
      setAmount('');
      const firstExp = categories.find((c) => c.type === 'expense');
      if (firstExp) setCategoryId(firstExp.id);
      setPaymentMethod('UPI');
      setFrequency('monthly');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setNotes('');
    }
    setErrors({});
  }, [itemToEdit, isOpen, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Payment name is required';
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) errs.amount = 'Amount must be greater than zero';
    if (!nextDueDate) errs.nextDueDate = 'Next due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : 'Other';

    const payload = {
      name: name.trim(),
      amount: parseFloat(amount),
      type,
      categoryId,
      categoryName,
      paymentMethod,
      frequency,
      nextDueDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
    };

    if (itemToEdit) {
      updateRecurringPayment(itemToEdit.id, payload);
    } else {
      addRecurringPayment(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {itemToEdit ? 'Edit Recurring Schedule' : 'New Recurring Schedule'}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'expense'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Recurring Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'income'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Recurring Income
            </button>
          </div>

          {/* Name & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Name / Subscription *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Netflix, Gym, House Rent"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
                autoFocus
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 tabular-nums">
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
                  className="w-full pl-7 pr-3 py-2 text-xs font-semibold tabular-nums bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
            </div>
          </div>

          {/* Frequency & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Next Due Date & Optional End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Next Due Date *
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => {
                  setNextDueDate(e.target.value);
                  if (errors.nextDueDate) setErrors((prev) => ({ ...prev, nextDueDate: '' }));
                }}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              />
              {errors.nextDueDate && <p className="text-[11px] text-rose-500 mt-1">{errors.nextDueDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Optional End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
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
                  className={`py-1.5 px-1 text-[11px] font-medium rounded-lg border text-center transition-colors truncate cursor-pointer ${
                    paymentMethod === pm
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {itemToEdit ? 'Save Changes' : 'Save Recurring Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
