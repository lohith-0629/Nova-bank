import React, { useMemo, useState } from 'react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { TransactionList } from '../components/transactions/TransactionList';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { useBank } from '../hooks/useBank';
import { useToast } from '../hooks/useToast';
import { Transaction, TransactionCategory } from '../types/banking';
import { downloadTransactionsCsv } from '../utils/csv';
import { formatCurrency } from '../utils/format';

const CATEGORIES: ('All' | TransactionCategory)[] = [
  'All',
  'Income',
  'Transfer',
  'Utilities',
  'Shopping',
  'Dining',
  'Subscription',
  'Rent',
  'Recharge',
  'Credit Card',
  'Other',
];

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export const TransactionsPage: React.FC = () => {
  const { state } = useBank();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TransactionCategory>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = state.transactions.filter((txn) => {
      if (typeFilter !== 'all' && txn.type !== typeFilter) return false;
      if (categoryFilter !== 'All' && txn.category !== categoryFilter) return false;

      if (fromDate) {
        const txnDate = txn.date.slice(0, 10);
        if (txnDate < fromDate) return false;
      }
      if (toDate) {
        const txnDate = txn.date.slice(0, 10);
        if (txnDate > toDate) return false;
      }

      if (q) {
        const haystack = `${txn.id} ${txn.description} ${txn.counterparty} ${txn.category} ${
          txn.method ?? ''
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [categoryFilter, fromDate, search, sortBy, state.transactions, toDate, typeFilter]);

  const summary = useMemo(() => {
    let credits = 0;
    let debits = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'credit') credits += t.amount;
      else debits += t.amount;
    }
    return { credits, debits };
  }, [filteredTransactions]);

  const hasActiveFilters =
    Boolean(search) ||
    typeFilter !== 'all' ||
    categoryFilter !== 'All' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setFromDate('');
    setToDate('');
    setSortBy('date-desc');
  };

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      addToast({
        type: 'warning',
        title: 'Nothing to export',
        description: 'Adjust filters to include at least one transaction.',
      });
      return;
    }
    downloadTransactionsCsv(filteredTransactions);
    addToast({
      type: 'success',
      title: 'CSV statement downloaded',
      description: `${filteredTransactions.length} transaction(s) exported.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <InputField
              placeholder="Search by ID, description, recipient/sender..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportCsv}
            >
              Download CSV
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                leftIcon={<RotateCcw className="h-4 w-4" />}
                onClick={resetFilters}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="credit">Money Received (+)</option>
              <option value="debit">Money Sent (-)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'All' | TransactionCategory)
              }
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Matching Records</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {filteredTransactions.length}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Received</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(summary.credits)}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Sent</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
            -{formatCurrency(summary.debits)}
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4 sm:p-5">
        <TransactionList
          transactions={filteredTransactions}
          onSelect={setSelectedTxn}
          emptyAction={
            hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Reset All Filters
              </Button>
            ) : undefined
          }
        />
      </div>

      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};
