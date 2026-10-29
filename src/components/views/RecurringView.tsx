/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RecurringPayment } from '../../types';
import { formatCurrency, parseMonthKey } from '../../utils/calculations';
import { RecurringModal } from '../modals/RecurringModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const RecurringView: React.FC = () => {
  const {
    recurringPayments,
    deleteRecurringPayment,
    recordRecurringPaymentAsPaid,
    activeMonthKey,
    settings,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RecurringPayment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { label: monthLabel } = parseMonthKey(activeMonthKey);

  // Group recurring rules: Expenses & Income
  const recurringExpenses = recurringPayments.filter((r) => r.type === 'expense');
  const recurringIncome = recurringPayments.filter((r) => r.type === 'income');

  const monthlyExpenseCommitment = recurringExpenses.reduce((sum, r) => {
    if (r.frequency === 'weekly') return sum + r.amount * 4.33;
    if (r.frequency === 'monthly') return sum + r.amount;
    if (r.frequency === 'quarterly') return sum + r.amount / 3;
    if (r.frequency === 'yearly') return sum + r.amount / 12;
    return sum + r.amount;
  }, 0);

  const monthlyIncomeCommitment = recurringIncome.reduce((sum, r) => {
    if (r.frequency === 'weekly') return sum + r.amount * 4.33;
    if (r.frequency === 'monthly') return sum + r.amount;
    if (r.frequency === 'quarterly') return sum + r.amount / 3;
    if (r.frequency === 'yearly') return sum + r.amount / 12;
    return sum + r.amount;
  }, 0);

  // Status badge for next due date
  const getDueStatus = (dueDateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dueDateStr < today) {
      return { label: 'Overdue', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200' };
    }
    if (dueDateStr === today) {
      return { label: 'Due Today', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200' };
    }
    // Check if within 7 days
    const todayDate = new Date();
    const [y, m, d] = dueDateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const diffDays = Math.ceil((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return { label: `Due in ${diffDays}d`, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200' };
    }
    return { label: dueDateStr, color: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border-neutral-200' };
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Recurring Payments & Subscriptions
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Automate recurring bill reminders and log transactions with a single click
          </p>
        </div>

        <button
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Recurring Schedule</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Monthly Recurring Outflow
          </span>
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(monthlyExpenseCommitment, settings.currencyCode)}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {recurringExpenses.length} recurring expense subscriptions
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Monthly Recurring Inflow
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(monthlyIncomeCommitment, settings.currencyCode)}
          </span>
          <p className="text-xs text-neutral-400 mt-1">
            {recurringIncome.length} scheduled retainer/salary streams
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Ledger Distinction Rule
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">
            Scheduled payments are reminders only and <strong>never deduct</strong> from your dashboard budget until recorded as paid.
          </p>
        </div>
      </div>

      {/* Recurring Schedules List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Active Recurring Schedules ({recurringPayments.length})
          </h2>
          <span className="text-xs text-neutral-400">
            Click &quot;Record Paid&quot; to log directly into your transaction ledger
          </span>
        </div>

        {recurringPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              No recurring payments scheduled.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Add subscriptions, rent, insurance, or salary schedules to stay on top of upcoming dues.
            </p>
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg"
            >
              Add First Recurring Item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recurringPayments.map((item) => {
              const dueStatus = getDueStatus(item.nextDueDate);
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${dueStatus.color}`}
                        >
                          {dueStatus.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                        <span>{item.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.frequency}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.paymentMethod}</span>
                        {item.lastRecordedDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Last paid: {item.lastRecordedDate}</span>
                          </>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-neutral-400 mt-1 truncate">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-neutral-100 dark:border-neutral-800">
                    <span
                      className={`text-base font-bold tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {isIncome ? '+' : ''}
                      {formatCurrency(item.amount, settings.currencyCode)}
                    </span>

                    <button
                      onClick={() => recordRecurringPaymentAsPaid(item.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Paid</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setItemToEdit(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                        title="Edit schedule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RecurringModal
        isOpen={isModalOpen}
        itemToEdit={itemToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
      />

      <ConfirmationModal
        isOpen={!!deletingId}
        title="Delete Recurring Schedule"
        message="Are you sure you want to delete this recurring schedule? Previously logged transactions will remain untouched."
        confirmLabel="Delete Schedule"
        isDestructive={true}
        onConfirm={() => {
          if (deletingId) deleteRecurringPayment(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
