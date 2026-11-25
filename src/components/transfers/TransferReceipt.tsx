import React from 'react';
import { Check, CheckCircle2, Copy, Printer, Send } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Transaction } from '../../types/banking';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TransferReceiptProps {
  transaction: Transaction;
  ifscCode?: string;
  onNewTransfer: () => void;
  onViewTransactions: () => void;
}

export const TransferReceipt: React.FC<TransferReceiptProps> = ({
  transaction,
  ifscCode,
  onNewTransfer,
  onViewTransactions,
}) => {
  const { copiedKey, copy } = useCopyToClipboard();

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm animate-scale-in print-only-area">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Transfer Successful
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your simulated transfer has been processed and recorded.
        </p>
        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
          {formatCurrency(transaction.amount)}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Transaction Reference
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
              {transaction.id}
            </span>
            <button
              type="button"
              onClick={() => copy(transaction.id, 'receipt-id')}
              className="no-print inline-flex items-center gap-1 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              {copiedKey === 'receipt-id' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy ID
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-slate-100 dark:divide-navy-800 text-sm">
        <div className="flex justify-between py-2.5">
          <dt className="text-slate-500 dark:text-slate-400">Recipient</dt>
          <dd className="font-medium text-slate-900 dark:text-white">
            {transaction.counterparty}
          </dd>
        </div>
        {transaction.counterpartyAccount && (
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Account Number</dt>
            <dd className="font-mono text-xs text-slate-900 dark:text-white">
              {transaction.counterpartyAccount}
            </dd>
          </div>
        )}
        {ifscCode && (
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">IFSC Code</dt>
            <dd className="font-mono text-xs text-slate-900 dark:text-white">{ifscCode}</dd>
          </div>
        )}
        <div className="flex justify-between py-2.5">
          <dt className="text-slate-500 dark:text-slate-400">Payment Rail</dt>
          <dd>
            <Badge variant="navy">{transaction.method ?? 'IMPS'}</Badge>
          </dd>
        </div>
        <div className="flex justify-between py-2.5">
          <dt className="text-slate-500 dark:text-slate-400">Description</dt>
          <dd className="font-medium text-slate-900 dark:text-white">
            {transaction.description}
          </dd>
        </div>
        <div className="flex justify-between py-2.5">
          <dt className="text-slate-500 dark:text-slate-400">Timestamp</dt>
          <dd className="text-slate-900 dark:text-white">
            {formatDateTime(transaction.date)}
          </dd>
        </div>
        <div className="flex justify-between py-2.5">
          <dt className="text-slate-500 dark:text-slate-400">Remaining Balance</dt>
          <dd className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(transaction.balanceAfter)}
          </dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 no-print">
        <Button
          variant="outline"
          leftIcon={<Printer className="h-4 w-4" />}
          onClick={() => window.print()}
          fullWidth
        >
          Print Receipt
        </Button>
        <Button
          variant="outline"
          onClick={onViewTransactions}
          fullWidth
        >
          View History
        </Button>
        <Button
          variant="primary"
          leftIcon={<Send className="h-4 w-4" />}
          onClick={onNewTransfer}
          fullWidth
        >
          Send Another
        </Button>
      </div>
    </div>
  );
};
