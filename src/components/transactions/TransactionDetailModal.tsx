import React from 'react';
import { Check, Copy, Printer, ShieldCheck } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Transaction } from '../../types/banking';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const { copiedKey, copy } = useCopyToClipboard();

  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={Boolean(transaction)}
      onClose={onClose}
      title="Transaction Receipt"
      subtitle="Simulated digital ledger record"
      footer={
        <>
          <Button
            variant="outline"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print Receipt
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="print-only-area space-y-5">
        <div className="rounded-2xl border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/60 p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isCredit ? 'Money Received' : 'Money Sent'}
          </p>
          <p
            className={`mt-1 text-3xl font-bold tabular-nums ${
              isCredit
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {isCredit ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>
          <div className="mt-2.5 flex justify-center">
            <Badge
              variant={
                transaction.status === 'Completed'
                  ? 'success'
                  : transaction.status === 'Pending'
                    ? 'warning'
                    : 'danger'
              }
            >
              {transaction.status}
            </Badge>
          </div>
        </div>

        <dl className="divide-y divide-slate-100 dark:divide-navy-800 text-sm">
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Transaction ID</dt>
            <dd className="flex items-center gap-2 font-mono text-xs font-medium text-slate-900 dark:text-white">
              <span>{transaction.id}</span>
              <button
                type="button"
                onClick={() => copy(transaction.id, 'txn-id')}
                aria-label="Copy transaction ID"
                className="no-print rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-navy-800 dark:hover:text-slate-200"
              >
                {copiedKey === 'txn-id' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Date & Time</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {formatDateTime(transaction.date)}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">
              {isCredit ? 'Sender' : 'Recipient'}
            </dt>
            <dd className="text-right font-medium text-slate-900 dark:text-white">
              {transaction.counterparty}
            </dd>
          </div>
          {transaction.counterpartyAccount && (
            <div className="flex items-center justify-between py-2.5 gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Account Number</dt>
              <dd className="font-mono text-xs text-slate-800 dark:text-slate-200">
                {transaction.counterpartyAccount}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Description</dt>
            <dd className="text-right font-medium text-slate-900 dark:text-white">
              {transaction.description}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Category</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {transaction.category}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Payment Method</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {transaction.method ?? 'Standard'}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5 gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Balance After</dt>
            <dd className="font-semibold tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(transaction.balanceAfter)}
            </dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
};
