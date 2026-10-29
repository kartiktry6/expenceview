/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetsView } from './components/views/BudgetsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { RecurringView } from './components/views/RecurringView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionModal } from './components/modals/TransactionModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { Toast } from './components/common/Toast';

const MainApp: React.FC = () => {
  const { transactions, settings } = useFinance();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  const shouldShowOnboarding =
    !settings.hasCompletedOnboarding &&
    transactions.length === 0 &&
    !dismissedOnboarding;

  return (
    <div className="min-h-screen bg-neutral-100/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col lg:flex-row transition-colors">
      {/* Desktop Navy/Charcoal Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-8">
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenAddTransaction={() => setIsAddTxOpen(true)}
            />
          )}
          {currentTab === 'transactions' && (
            <TransactionsView onOpenAddTransaction={() => setIsAddTxOpen(true)} />
          )}
          {currentTab === 'budgets' && <BudgetsView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'recurring' && <RecurringView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Global Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      {/* First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={shouldShowOnboarding}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
        onClose={() => setDismissedOnboarding(true)}
      />

      {/* Toast Notification with Undo */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
