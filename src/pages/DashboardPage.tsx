import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { AddMoneyModal } from '../components/dashboard/AddMoneyModal';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { TransactionList } from '../components/transactions/TransactionList';
import { Badge } from '../components/ui/Badge';
import { useBank } from '../hooks/useBank';
import { Transaction } from '../types/banking';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/format';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardPage: React.FC = () => {
  const { state } = useBank();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    let income = 0;
    let expenses = 0;

    for (const txn of state.transactions) {
      if (txn.status !== 'Completed') continue;
      const d = new Date(txn.date);
      if (d.getMonth() === curMonth && d.getFullYear() === curYear) {
        if (txn.type === 'credit') income += txn.amount;
        else expenses += txn.amount;
      }
    }

    return {
      income,
      expenses,
      net: income - expenses,
    };
  }, [state.transactions]);

  const recentTransactions = useMemo(
    () => state.transactions.slice(0, 5),
    [state.transactions]
  );

  const upcomingBills = useMemo(
    () =>
      state.bills
        .filter((b) => b.status === 'Unpaid')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4),
    [state.bills]
  );

  const recentNotifications = useMemo(
    () => state.notifications.slice(0, 3),
    [state.notifications]
  );

  return (
    <div className="space-y-6">
      {/* Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, {state.profile.fullName.split(' ')[0]}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here is your simulated financial summary for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CreditCard className="h-4 w-4 text-emerald-500" />
          <span>
            Virtual Card ({state.card.lastFour}):{' '}
            <strong
              className={
                state.card.status === 'Active'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }
            >
              {state.card.status}
            </strong>
          </span>
        </div>
      </div>

      {/* Balance Card */}
      <BalanceCard onOpenAddMoney={() => setAddMoneyOpen(true)} />

      {/* Monthly Income & Expense Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Income
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(monthlyStats.income)}
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            Credits recorded this month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Expenses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(monthlyStats.expenses)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Transfers, bills & card spends
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Cashflow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-bold tabular-nums ${
              monthlyStats.net >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {monthlyStats.net >= 0 ? '+' : ''}
            {formatCurrency(monthlyStats.net)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Income minus expenses
          </p>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chart + Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Spending Analytics
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  6-month income vs. expense activity
                </p>
              </div>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-600 dark:text-emerald-400"
              >
                Full analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <SpendingChart transactions={state.transactions} />
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any transaction to view or print its receipt
                </p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-emerald-600 dark:text-emerald-400"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <TransactionList
              transactions={recentTransactions}
              onSelect={setSelectedTxn}
              compact
            />
          </section>
        </div>

        {/* Right Col: Upcoming Bills + Notifications + Account Activity */}
        <div className="space-y-6">
          {/* Upcoming Bills */}
          <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Upcoming Bills
                </h3>
              </div>
              <Link
                to="/payments"
                className="text-xs font-semibold text-navy-900 hover:text-emerald-600 dark:text-emerald-400"
              >
                Manage
              </Link>
            </div>

            {upcomingBills.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                All bill reminders are paid!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-800/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {bill.billerName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Due {formatDate(bill.dueDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(bill.amount)}
                      </p>
                      <Link
                        to="/payments"
                        state={{ billId: bill.id }}
                        className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Pay now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-navy-900 hover:text-emerald-600 dark:text-emerald-400"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-slate-100 dark:border-navy-800 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {n.title}
                    </p>
                    {!n.read && <Badge variant="success">New</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatRelativeTime(n.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Account Activity Summary */}
          <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
              Account Activity
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Saved Beneficiaries</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {state.beneficiaries.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Total Transactions</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {state.transactions.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Card Monthly Spend</dt>
                <dd className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(state.card.monthlySpent)} /{' '}
                  {formatCurrency(state.card.monthlyLimit)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Last Sign-In</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {state.auth.lastLoginAt
                    ? formatRelativeTime(state.auth.lastLoginAt)
                    : 'Just now'}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <AddMoneyModal isOpen={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};
