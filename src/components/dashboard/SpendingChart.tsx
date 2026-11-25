import React, { useMemo, useState } from 'react';
import { Transaction } from '../../types/banking';
import { formatCurrency } from '../../utils/format';

interface SpendingChartProps {
  transactions: Transaction[];
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      months.push({ key, label, income: 0, expense: 0 });
    }

    for (const txn of transactions) {
      if (txn.status !== 'Completed') continue;
      const d = new Date(txn.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) {
        if (txn.type === 'credit') bucket.income += txn.amount;
        else bucket.expense += txn.amount;
      }
    }

    return months;
  }, [transactions]);

  const maxVal = useMemo(() => {
    const peak = Math.max(
      1000,
      ...monthlySeries.map((m) => Math.max(m.income, m.expense))
    );
    return Math.ceil(peak / 500) * 500;
  }, [monthlySeries]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            Income
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-navy-900 dark:bg-slate-400" />
            Expenses
          </span>
        </div>
        {hoveredIdx !== null && monthlySeries[hoveredIdx] && (
          <div className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
            <span className="font-semibold">{monthlySeries[hoveredIdx].label}:</span>{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(monthlySeries[hoveredIdx].income)}
            </span>{' '}
            /{' '}
            <span>-{formatCurrency(monthlySeries[hoveredIdx].expense)}</span>
          </div>
        )}
      </div>

      {/* Pure CSS / SVG bar chart */}
      <div className="relative h-52 pt-4">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[1, 0.5, 0].map((ratio) => (
            <div
              key={ratio}
              className="flex items-center gap-2 border-b border-dashed border-slate-100 dark:border-navy-800 pb-1"
            >
              <span className="w-12 text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                ${Math.round(maxVal * ratio)}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex h-full items-end justify-between gap-2 pl-14 pr-2 pb-6">
          {monthlySeries.map((month, idx) => {
            const incHeight = Math.max(4, Math.round((month.income / maxVal) * 100));
            const expHeight = Math.max(4, Math.round((month.expense / maxVal) * 100));
            return (
              <div
                key={month.key}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex flex-1 flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div className="flex items-end gap-1.5 h-36 w-full justify-center">
                  <div
                    className="w-3 sm:w-4 rounded-t-md bg-emerald-500 transition-all duration-300 group-hover:bg-emerald-400"
                    style={{ height: `${month.income > 0 ? incHeight : 2}%` }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />
                  <div
                    className="w-3 sm:w-4 rounded-t-md bg-navy-900 dark:bg-slate-400 transition-all duration-300 group-hover:opacity-80"
                    style={{ height: `${month.expense > 0 ? expHeight : 2}%` }}
                    title={`Expense: ${formatCurrency(month.expense)}`}
                  />
                </div>
                <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {month.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
