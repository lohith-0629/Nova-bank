import React from 'react';
import { Receipt } from 'lucide-react';
import { Transaction } from '../../types/banking';
import { EmptyState } from '../ui/EmptyState';
import { TransactionCard } from './TransactionCard';

interface TransactionListProps {
  transactions: Transaction[];
  onSelect?: (transaction: Transaction) => void;
  hideAmounts?: boolean;
  compact?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelect,
  hideAmounts = false,
  compact = false,
  emptyTitle = 'No transactions found',
  emptyDescription = 'Try adjusting your search query or filters to view matching activity.',
  emptyAction,
}) => {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-navy-800/80">
      {transactions.map((txn) => (
        <TransactionCard
          key={txn.id}
          transaction={txn}
          onSelect={onSelect}
          hideAmount={hideAmounts}
          compact={compact}
        />
      ))}
    </div>
  );
};
