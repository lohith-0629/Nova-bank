import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  CreditCard,
  Home,
  Laptop,
  ShoppingBag,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../../types/banking';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Badge } from '../ui/Badge';

interface TransactionCardProps {
  transaction: Transaction;
  onSelect?: (transaction: Transaction) => void;
  hideAmount?: boolean;
  compact?: boolean;
}

export function getCategoryIcon(category: TransactionCategory, type: 'credit' | 'debit') {
  if (type === 'credit') {
    return <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  }
  switch (category) {
    case 'Dining':
      return <Coffee className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case 'Shopping':
      return <ShoppingBag className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
    case 'Utilities':
      return <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case 'Rent':
      return <Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
    case 'Subscription':
      return <Laptop className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case 'Recharge':
      return <Smartphone className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
    case 'Credit Card':
      return <CreditCard className="h-4 w-4 text-slate-600 dark:text-slate-300" />;
    default:
      return <ArrowUpRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />;
  }
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onSelect,
  hideAmount = false,
  compact = false,
}) => {
  const isCredit = transaction.type === 'credit';

  return (
    <button
      type="button"
      onClick={() => onSelect?.(transaction)}
      className="w-full text-left flex items-center justify-between gap-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-navy-700 hover:bg-slate-50/80 dark:hover:bg-navy-800/50 px-3.5 py-3 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isCredit
              ? 'bg-emerald-50 dark:bg-emerald-950/50'
              : 'bg-slate-100 dark:bg-navy-800'
          }`}
        >
          {getCategoryIcon(transaction.category, transaction.type)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {transaction.description}
            </p>
            {!compact && (
              <Badge variant="default" className="hidden sm:inline-flex">
                {transaction.category}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">{transaction.counterparty}</span>
            <span>•</span>
            <span>{formatDateTime(transaction.date)}</span>
            {!compact && transaction.method && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">{transaction.method}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`text-sm font-semibold tabular-nums ${
            isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {hideAmount
            ? '••••••'
            : `${isCredit ? '+' : '-'}${formatCurrency(transaction.amount)}`}
        </p>
        {!compact && (
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
            Bal: {hideAmount ? '••••' : formatCurrency(transaction.balanceAfter)}
          </p>
        )}
      </div>
    </button>
  );
};
