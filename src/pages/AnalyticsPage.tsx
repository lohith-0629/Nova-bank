import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { useBank } from '../hooks/useBank';
import { TransactionCategory } from '../types/banking';
import { formatCurrency } from '../utils/format';

type Timeframe = 'month' | '3m' | '6m' | 'all';

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#0B132B',
  Shopping: '#10B981',
  Utilities: '#0EA5E9',
  Transfer: '#6366F1',
  Dining: '#F59E0B',
  Subscription: '#8B5CF6',
  Recharge: '#14B8A6',
  'Credit Card': '#EC4899',
  Other: '#64748B',
};

export const AnalyticsPage: React.FC = () => {
  const { state } = useBank();
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const filteredTxns = useMemo(() => {
    const now = new Date();
    return state.transactions.filter((t) => {
      if (t.status !== 'Completed') return false;
      const d = new Date(t.date);
      if (timeframe === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (timeframe === '3m') {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3);
        return d >= cutoff;
      }
      if (timeframe === '6m') {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 6);
        return d >= cutoff;
      }
      return true;
    });
  }, [state.transactions, timeframe]);

  const stats = useMemo(() => {
    let income = 0;
    let spending = 0;
    let largestExpense = 0;
    let debitCount = 0;
    let creditCount = 0;

    const categoryTotals: Record<string, number> = {};

    for (const t of filteredTxns) {
      if (t.type === 'credit') {
        income += t.amount;
        creditCount += 1;
      } else {
        spending += t.amount;
        debitCount += 1;
        if (t.amount > largestExpense) largestExpense = t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
      }
    }

    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: category as TransactionCategory,
        amount,
        percentage: spending > 0 ? Math.round((amount / spending) * 1000) / 10 : 0,
        color: CATEGORY_COLORS[category] ?? '#64748B',
      }))
      .sort((a, b) => b.amount - a.amount);

    const savingsRate =
      income > 0 ? Math.max(0, Math.round(((income - spending) / income) * 100)) : 0;
    const avgTxn =
      filteredTxns.length > 0
        ? (income + spending) / filteredTxns.length
        : 0;

    return {
      income,
      spending,
      savingsRate,
      largestExpense,
      avgTxn,
      debitCount,
      creditCount,
      categories,
    };
  }, [filteredTxns]);

  // Weekly spending breakdown (Mon - Sun)
  const weeklySpending = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    for (const t of filteredTxns) {
      if (t.type === 'debit') {
        const dayIdx = new Date(t.date).getDay();
        totals[dayIdx] += t.amount;
      }
    }
    const maxDay = Math.max(100, ...totals);
    return days.map((label, idx) => ({
      label,
      amount: totals[idx],
      pct: Math.round((totals[idx] / maxDay) * 100),
    }));
  }, [filteredTxns]);

  // Build SVG Donut segments using stroke-dasharray
  const donutSegments = useMemo(() => {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return stats.categories.map((cat) => {
      const length = (cat.percentage / 100) * circumference;
      const seg = {
        ...cat,
        circumference,
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -offset,
      };
      offset += length;
      return seg;
    });
  }, [stats.categories]);

  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cashflow & Spending Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Computed locally from your transaction ledger
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-1">
          {(
            [
              { id: 'month', label: 'This Month' },
              { id: '3m', label: '3 Months' },
              { id: '6m', label: '6 Months' },
              { id: 'all', label: 'All Time' },
            ] as { id: Timeframe; label: string }[]
          ).map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                timeframe === tf.id
                  ? 'bg-navy-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Income</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(stats.income)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{stats.creditCount} credit transactions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Spending</span>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(stats.spending)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{stats.debitCount} debit transactions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Savings Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.savingsRate}%
          </p>
          <p className="mt-1 text-xs text-slate-400">Of total period income</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Largest Expense</span>
            <BarChart3 className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(stats.largestExpense)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Avg txn: {formatCurrency(stats.avgTxn)}
          </p>
        </div>
      </div>

      {/* Category Donut + Weekly Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories SVG Donut */}
        <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="h-4 w-4 text-emerald-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Expense Categories
            </h3>
          </div>

          {stats.categories.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No expense data for the selected timeframe.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative h-44 w-44 shrink-0">
                <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="18"
                    className="text-slate-100 dark:text-navy-800"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.category}
                      cx="70"
                      cy="70"
                      r="56"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={hoveredCat === seg.category ? '22' : '18'}
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredCat(seg.category)}
                      onMouseLeave={() => setHoveredCat(null)}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] text-slate-400">
                    {hoveredCat ?? 'Total Spend'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(
                      hoveredCat
                        ? stats.categories.find((c) => c.category === hoveredCat)?.amount ?? 0
                        : stats.spending
                    )}
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2.5">
                {stats.categories.map((cat) => (
                  <div
                    key={cat.category}
                    onMouseEnter={() => setHoveredCat(cat.category)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className="space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.category}
                      </span>
                      <span className="tabular-nums text-slate-600 dark:text-slate-300">
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Weekly Spending */}
        <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Spending by Day of Week
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of debit transactions across weekdays
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 h-44 pt-4">
            {weeklySpending.map((day) => (
              <div
                key={day.label}
                className="flex-1 flex flex-col items-center justify-end h-full group"
              >
                <span className="mb-1 text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  ${Math.round(day.amount)}
                </span>
                <div className="w-full max-w-[36px] flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-navy-900 dark:bg-emerald-500 group-hover:bg-emerald-600 transition-all duration-300"
                    style={{ height: `${Math.max(6, day.pct)}%` }}
                    title={`${day.label}: ${formatCurrency(day.amount)}`}
                  />
                </div>
                <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 6-Month Income vs Spending Trend */}
      <section className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            6-Month Income vs. Expense Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hover over bars to inspect monthly totals
          </p>
        </div>
        <SpendingChart transactions={state.transactions} />
      </section>
    </div>
  );
};
